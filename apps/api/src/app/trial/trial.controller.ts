import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  OnModuleInit,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import {TrialService} from './trial.service';
import {CreateTrialDto} from './dto/create-trial.dto';
import {UpdateTrialDto} from './dto/update-trial.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiFoundResponse, ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from "@nestjs/swagger";
import { event_type, trial, user } from "@prisma/client";
import {KeycloakPasswordGuard} from "../auth/KeycloakPasswordGuard";
import {CurrentUser} from "../auth/CurrentUser";
import {UpdateTrialSchemasDto} from "./dto/update-trial-schemas.dto";
import { EventService } from "../event/event.service";
import { ModuleRef } from "@nestjs/core";
import axios from 'axios';
import {TrialLockService} from "../trial-lock/trial-lock.service";
import {MatchminerService} from "../matchminer/matchminer.service";

@Controller('trials')
@ApiTags("Trial")
export class TrialController implements OnModuleInit{

  private eventService: EventService;
  private trialLockService: TrialLockService;
  private matchminerService: MatchminerService;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly trialService: TrialService,
    ) { }

  onModuleInit(): any {
    this.eventService = this.moduleRef.get(EventService, { strict: false });
    this.trialLockService = this.moduleRef.get(TrialLockService, { strict: false });
    this.matchminerService = this.moduleRef.get(MatchminerService, { strict: false });
  }

  @Post()
  @UseGuards(KeycloakPasswordGuard)
  @ApiBearerAuth("KeycloakPasswordGuard")
  @ApiOperation({ summary: "Create a new trial" })
  @ApiCreatedResponse({ description: "New trial created." })
  async create(
    @CurrentUser() user: user,
    @Body() createTrialDto: CreateTrialDto
  ): Promise<trial> {
    const newTrial = await this.trialService.createTrial(createTrialDto, user);
    this.eventService.createEvent({
      type: event_type.TrialCreated,
      description: "Trial created via Post to /trials",
      user,
      trial: newTrial,
      metadata: {
        input: {
          createTrialDto: { ...createTrialDto }
        },
        output: {
          id: newTrial.id
        }
      }
    });
    return newTrial;
  }

  @Post(':id/export/:format')
  @UseGuards(KeycloakPasswordGuard)
  @ApiBearerAuth("KeycloakPasswordGuard")
  @ApiOperation({ summary: "Called when trial has been exported on the front end." })
  @ApiParam({ name: "id", description: "ID of the trial." })
  @ApiParam({ name: "format", description: "Format of the export. Limited to the values 'YAML' and 'JSON'" })
  @ApiNoContentResponse()
  async trialExported(
    @CurrentUser() user: user,
    @Param('id') id: string,
    @Param('format') format: string
  ) {
    if (format !== 'YAML' && format !== 'JSON') {
      throw new NotFoundException(`Format ${format} is not supported.`);
    }
    // Add event
    this.eventService.createEvent({
      type: event_type.TrialExported,
      description: "Trial exported via Post to /trials/:id/export/:format",
      user,
      trial: { id: +id },
      metadata: {
        input: { id, format }
      }
    });
  }

  @Get()
  @UseGuards(KeycloakPasswordGuard)
  @ApiBearerAuth("KeycloakPasswordGuard")
  @ApiOperation({ summary: "Get all trials" })
  @ApiOkResponse({ description: "List of trials found." })
  async findAll(@CurrentUser() user: user) {
    this.eventService.createEvent({
      type: event_type.TrialReadMany,
      description: "Trials read via Get to /trials",
      user
    });
    return this.trialService.findAll();
  }

  @Post('trialsByIds')
  @UseGuards(KeycloakPasswordGuard)
  @ApiBearerAuth("KeycloakPasswordGuard")
  @ApiOperation({ summary: "Get trials by IDs" })
  @ApiOkResponse({ description: "List of trials found." })
  async findByIDs(@CurrentUser() user: user, @Body() body: { trialIDList: string[] }) {
    this.eventService.createEvent({
      type: event_type.TrialReadMany,
      description: "Trials read via Get to /trials/trialsByIds",
      user
    });
    return this.trialService.findTrialsByIds(body.trialIDList);
  }

  @Get(':id')
  @UseGuards(KeycloakPasswordGuard)
  @ApiBearerAuth("KeycloakPasswordGuard")
  @ApiOperation({ summary: "Get a trial by ID" })
  @ApiParam({ name: "id", description: "ID of the trial." })
  @ApiFoundResponse({ description: "Object found." })
  @ApiNotFoundResponse({ description: "Trial with the requested ID could not be found." })
  async findOne(@CurrentUser() user: user, @Param('id') id: string) {

    const trial = await this.trialService.findOne(+id, user);

    // Add event
    this.eventService.createEvent({
      type: event_type.TrialRead,
      description: "Trial read via Get to /trials/:id",
      user,
      trial,
      metadata: {
        input: { id }
      }
    });

    if (!trial) {
      throw new NotFoundException(`Trial with ID ${id} was not found.`)
    } else {
      // lock the trial if it is not already locked
      // create a lock if there is none
      const lock = await this.trialLockService.getLockByOthers(+id, user);
      if (!lock) {
        await this.trialLockService.create(+id, user);
      }
    }
    return trial
  }

  @Get(':id/ctml-schemas')
  @UseGuards(KeycloakPasswordGuard)
  @ApiBearerAuth("KeycloakPasswordGuard")
  @ApiOperation({ summary: "Get a list of CTML schema records associated with a trial" })
  @ApiParam({ name: "id", description: "ID of the trial." })
  @ApiFoundResponse({ description: "CTML schema list found." })
  @ApiNotFoundResponse({ description: "Trial with the requested ID could not be found." })
  async findRelatedSchemas(@CurrentUser() user: user, @Param('id') id: string) {

    const result = await this.trialService.findSchemasByTrial(+id);

    // Add event
    this.eventService.createEvent({
      type: event_type.CtmlSchemaReadMany,
      description: "CTML Schemas read via Get to /trials/:id/ctml-schemas",
      user,
      trial: { id: +id },
      metadata: {
        input: { id }
      }
    });

    if (!result) {
      // Add event
      this.eventService.createEvent({
        type: event_type.TrialDoesNotExist,
        description: "Trial could not be found via Get to /trials/:id/ctml-schemas",
        user,
        metadata: {
          input: { id }
        }
      });
      throw new NotFoundException(`Trial with ID ${id} was not found.`)
    }
    return result
  }

  @Patch(':id')
  @UseGuards(KeycloakPasswordGuard)
  @ApiOperation({ summary: "Update or create a trial" })
  @ApiParam({ name: "id", description: "ID of the trial to update." })
  @ApiOkResponse({ description: "Object updated." })
  @ApiNotFoundResponse({ description: "Trial with the requested ID could not be found." })
  update(@Param('id') id: string,
         @CurrentUser() user: user,
         @Body() updateTrialDto: UpdateTrialDto) {

    return this.trialService.update(+id, updateTrialDto, user);
  }

  @Patch(':id/ctml-schemas')
  @UseGuards(KeycloakPasswordGuard)
  @ApiBearerAuth("KeycloakPasswordGuard")
  @ApiOperation({ summary: "Set the ctml schema list for a trail" })
  @ApiParam({ name: "id", description: "ID of the trial to update." })
  @ApiOkResponse({ description: "Object updated." })
  @ApiNotFoundResponse({ description: "Trial with the requested ID could not be found." })
  async updateAssocSchemas(
    @CurrentUser() user: user,
    @Param('id') id: string,
    @Body() updateTrialSchemasDto: UpdateTrialSchemasDto
  ) {
    // Add event
    this.eventService.createEvent({
      type: event_type.TrialUpdated,
      description: "Trial schema list updated via Patch to /trials/:id/ctml-schemas",
      user,
      trial: { id: +id },
      metadata: {
        input: {
          updateTrialDto: { ...updateTrialSchemasDto },
          id
        }
      }
    });
    return this.trialService.updateTrialSchemaList(+id, updateTrialSchemasDto, user);
  }

  @Delete(':id')
  @UseGuards(KeycloakPasswordGuard)
  @ApiBearerAuth("KeycloakPasswordGuard")
  @ApiOperation({ summary: "Delete a trial" })
  @ApiParam({ name: "id", description: "ID of the trial to delete." })
  @ApiOkResponse({ description: "Object deleted." })
  @ApiNotFoundResponse({ description: "Trial with the requested ID could not be found." })
  async delete(@CurrentUser() user: user, @Param('id') id: string) {
    // Add event
    this.eventService.createEvent({
      type: event_type.TrialDeleted,
      description: "Trial deleted via Delete to /trials/:id",
      user,
      metadata: {
        input: { id }
      }
    });

    const foundTrial = await this.trialService.findOne(+id, user);

    const p1 = this.trialService.delete(+id, user);
    const p2 = this.matchminerService.deleteTrial(foundTrial.trial_internal_id);

    return Promise.all([p1, p2]);
  }
}
