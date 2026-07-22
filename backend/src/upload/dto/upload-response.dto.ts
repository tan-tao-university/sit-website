import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    example: 'https://storage.googleapis.com/example-bucket/avatars/user.jpg',
  })
  url: string;
}
