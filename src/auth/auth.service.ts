import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) {}

    async register(user: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { email: user.email } });
        if (existingUser) {
            throw new ConflictException('User email already exists'); // Throw ConflictException
        }

        user.password = await bcrypt.hash(user.password, 10);
        const newUser = await this.userRepository.create(user)
       
        return await this.userRepository.save(newUser)
    }


    async login(user: LoginUserDto): Promise<{ token: string }> {
        // const hashedPassword = await bcrypt.hash(user.password, 10);
        const userDB = await this.userRepository.findOne({ where: { email: user.email } });

        if(!userDB){
            throw new UnauthorizedException('Invalid email or password.')
        }

        const isPasswordMatched = await bcrypt.compare(user.password, userDB.password)
        if(!isPasswordMatched){
            throw new UnauthorizedException('Invalid email or password.')
        }

        const payload = { id: userDB.id, email: userDB.email };
        const token = this.jwtService.sign(payload)
        return { token }
    }


}
