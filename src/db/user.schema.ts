import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    city: string;

    @Column("decimal", { precision: 9, scale: 6 })
    latitude: number;

    @Column("decimal", { precision: 9, scale: 6 })
    longitude: number;
}
