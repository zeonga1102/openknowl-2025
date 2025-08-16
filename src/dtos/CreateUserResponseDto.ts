import { Expose, Transform } from "class-transformer";

export class CreateUserResponseDto {
    @Expose()
    id: number;

    @Expose()
    username: string;

    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    @Transform(({ value }) => value ?? null)
    phone: string | null;
    
    @Expose()
    createdAt: Date;
}