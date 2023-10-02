import { ContactInfo, Employee, Meeting, Task } from './entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(ContactInfo)
    private readonly contactInfoRepository: Repository<ContactInfo>,
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async seed() {
    // Create users
    const ceo = this.employeeRepository.create({ name: 'Mr.CEO' });
    await this.employeeRepository.save(ceo);

    // Create contact info
    const ceoContactInfo = this.contactInfoRepository.create({
      email: 'ceo@email.com',
      employeeId: ceo.id,
    });

    // ceoContactInfo.employee = ceo; // The other way
    await this.contactInfoRepository.save(ceoContactInfo);

    const manager = this.employeeRepository.create({
      name: 'Mr.Manager',
      manager: ceo,
    });
    await this.employeeRepository.save(manager);

    // Create and assign some tasks
    const task1 = this.taskRepository.create({ name: 'Hire people' });
    await this.taskRepository.save(task1);
    const task2 = this.taskRepository.create({ name: 'Present to CEO' });
    await this.taskRepository.save(task2);

    manager.tasks = [task1, task2];

    // Create and assign some meetings
    const meeting1 = this.meetingRepository.create({ zoomUrl: 'zoom.com' });
    meeting1.attendees = [ceo];
    await this.meetingRepository.save(meeting1);
    manager.meetings = [meeting1];

    await this.employeeRepository.save(manager);
  }

  async getEmployeeById(id: number): Promise<Employee> {
    return this.employeeRepository.findOne({
      where: { id },
      relations: [
        'manager',
        'directReports',
        'tasks',
        'contactInfo',
        'meetings',
      ],
    });
  }

  // Use this approach for complex queries
  async getEmployeeUsingQueryBuilder(id: number): Promise<any> {
    return this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.directReports', 'directReports')
      .leftJoinAndSelect('employee.meetings', 'meetings')
      .leftJoinAndSelect('employee.tasks', 'tasks')
      .where('employee.id = :id', { id })
      .getOne();
  }
}
