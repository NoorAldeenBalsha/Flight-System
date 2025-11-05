import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ enum: ['CAPTURE', 'AUTHORIZE'], default: 'CAPTURE' })
  intent: 'CAPTURE' | 'AUTHORIZE';

  @ApiProperty({
    example: [
      {
        amount: {
          currency_code: 'USD',
          value: '100.00',
        },
      },
    ],
  })
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
}