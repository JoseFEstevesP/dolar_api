import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Audit } from '@/modules/security/audit/entities/audit.entity';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { User } from '@/modules/security/user/entities/user.entity';
import { AuditRepository } from '@/modules/security/audit/repository/audit.repository';
import { RolRepository } from '@/modules/security/rol/repository/rol.repository';
import { UserRepository } from '@/modules/security/user/repository/user.repository';

const entities = [User, Role, Audit] as const;

@Module({
	imports: [SequelizeModule.forFeature([...entities])],
	providers: [UserRepository, RolRepository, AuditRepository],
	exports: [UserRepository, RolRepository, AuditRepository, SequelizeModule],
})
export class DatabaseModule {}
