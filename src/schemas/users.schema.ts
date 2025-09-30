import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {
    @Prop({ required: true })
    firstName: string
    @Prop({ required: true })
    lastName: string
    @Prop({ required: true, unique: true })
    email: string


}

export const UserSchema = SchemaFactory.createForClass(User)