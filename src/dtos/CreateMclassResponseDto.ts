import { Expose, Transform } from "class-transformer";

export class CreateMClassResponseDto {
    @Expose()
    id: number;

    @Expose()
    title: string;

    @Expose()
    @Transform(({ value }) => value ?? null)
    description: string | null;

    @Expose()
    maxPeople: number;

    @Expose()
    deadline: Date;
    
    @Expose()
    startAt: Date;
    
    @Expose()
    endAt: Date;
    
    @Expose()
    fee: number;

    @Expose()
    createdAt: Date;
}