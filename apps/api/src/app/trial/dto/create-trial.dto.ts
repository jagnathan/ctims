import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {status, trial_status} from "@prisma/client";

export class CreateTrialDto {
  @ApiProperty()
  trial_internal_id: string;

  @ApiProperty()
  nct_id: string;

  @ApiPropertyOptional({
    minLength: 1,
    maxLength: 191
  })
  nickname?: string;

  @ApiPropertyOptional({
    minLength: 1,
    maxLength: 191
  })
  principal_investigator?: string;

  @ApiPropertyOptional({
    enum: status
  })
  status: status;

  @ApiPropertyOptional({
    enum: trial_status
  })
  trial_status: trial_status;

  @ApiProperty({
    description: "The ID of the schema for this trial data."
  })
  ctml_schema_version: number;

  @ApiProperty({description: 'Group Id of the trial'})
  group_id: string;

  @ApiProperty({description: 'The protocol no. of the trial'})
  protocol_no: string | number;
}
