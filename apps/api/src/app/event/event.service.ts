import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { event } from "@prisma/client";
import { ICreateEvent } from "./create-event.interface";
import { logger } from "nx/src/utils/logger";

@Injectable()
export class EventService {

  private readonly logger = new Logger(EventService.name, { timestamp: true });


  constructor(
    private readonly prismaService: PrismaService
  ) { }
  async createEvent(data: ICreateEvent): Promise<event> {
    try {
      // Get all trial groups that relate to a trial that the user is a member of
      const trialGroups = await this.prismaService.trial_group.findMany({
        where: {
          trials: {
            some: {
              user: { id: data.user.id  }
            }
          },
        }
      });
      // add the trial groups to the metadata
      if (data.metadata) {
        data.metadata["user"] = {
          trialGroups: trialGroups.map(t => ({ "name": t.name, "id": t.id }))
        }
      }

      // check if ctml_json record exits, ran into an error on QA where ctml_json is null
      if (data.ctml_json) {
        const isCtmlJsonExists = await this.prismaService.ctml_json.findUnique({
          where: {
            id: data.ctml_json.id
          }
        });
        if (!isCtmlJsonExists) {
          const trialId = data.trial ? data.trial.id : null;
          if (trialId) {
            throw new Error(`ctml_json record with id ${data.ctml_json.id} does not exist for user ${data.user.id} and trial ${data.trial.id}`);
          } else {
            const trialList = (data.metadata as any)?.input?.ctmlJson?.trial_list || [];
            const trial_internal_ids = trialList.map((trial: any) => trial.trialInformation?.trial_internal_id).filter((id: any) => id);
            throw new Error(`ctml_json record with id ${data.ctml_json.id} does not exist for user ${data.user.id} and trials ${trial_internal_ids.join(", ")}`);
          }

        }
      }

      return this.prismaService.event.create({
        data: {
          ...data,
          user: data.user ? { connect: { id: data.user.id }} : undefined,
          trial: data.trial ? { connect: { id: data.trial.id }} : undefined,
          ctml_json: data.ctml_json ? { connect: { id: data.ctml_json.id }} : undefined,
          ctml_schema: data.ctml_schema ? { connect: { id: data.ctml_schema.id }} : undefined
        }
      });
    } catch (e) {
      logger.error(`Error while creating audit log with input: ${JSON.stringify(data)}\n${e.stack}`);
    }
  }

  async findAll() {
    return this.prismaService.event.findMany()
  }
  async findByUserId(userId: number) {
    return this.prismaService.event.findMany({
      where: {
        userId
      },
      include: {
        user: {
          select: {
            email: true,
            first_name: true,
            last_name: true
          }
        },
        trial: {
          select: {
            nct_id: true,
            createdAt: true
          }
        }
      }

    })
  }
  async findByTrialId(trialId: number) {
    return this.prismaService.event.findMany({
      where: {
        trialId
      },
      include: {
        user: {
          select: {
            email: true,
            first_name: true,
            last_name: true
          }
        },
        trial: {
          select: {
            nct_id: true,
            principal_investigator: true,
            createdAt: true
          }
        }
      }
    })
  }
}
