export class CreateStudentDto {
  name: string;
  class: string;
  rollno: string;
  password: string;
  marks?: any;
  phone : string;
  email : string;
  addressLine1? : string;
  addressLine2? : string;
}
