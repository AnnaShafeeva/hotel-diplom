import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { SearchUserParamsDto } from './dto/search-user.params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    if (!data.email) throw new Error('Email is required');
    if (!data.passwordHash) throw new Error('Password is required');

    const existing = await this.userModel
      .findOne({ email: data.email })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.passwordHash, 10);

    const user = await this.userModel.create({
      ...data,
      passwordHash,
      role: data.role || 'client',
    });

    return this.toUser(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).lean().exec();

    return user ? this.toUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).lean().exec();

    return user ? this.toUser(user) : null;
  }

  async findAll(params: SearchUserParamsDto): Promise<User[]> {
    const { limit, offset, email, name, contactPhone } = params;

    const filter: any = {};
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (contactPhone)
      filter.contactPhone = { $regex: contactPhone, $options: 'i' };

    const users = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

    return users.map((u) => this.toUser(u));
  }

  private toUser(obj: any): User {
    return {
      _id: obj._id.toString(),
      email: obj.email,
      passwordHash: obj.passwordHash,
      name: obj.name,
      contactPhone: obj.contactPhone,
      role: obj.role,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
}
