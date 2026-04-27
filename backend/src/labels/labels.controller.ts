import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UsersService } from '../users/users.service';
import type { Request as ExpressRequest } from 'express';

@Controller()
@UseGuards(JwtAuthGuard)
export class LabelsController {
  constructor(
    private readonly labelsService: LabelsService,
    private readonly usersService: UsersService,
  ) {}

  private async getUser(req: ExpressRequest) {
    const userEntity = await this.usersService.findByEmail((req.user as any).email);
    if (!userEntity) throw new InternalServerErrorException('User not found');
    return userEntity;
  }

  @Post('teams/:teamId/labels')
  @HttpCode(HttpStatus.CREATED)
  async createLabel(
    @Request() req: ExpressRequest,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() dto: CreateLabelDto,
  ) {
    return this.labelsService.createLabel(await this.getUser(req), teamId, dto);
  }

  @Get('teams/:teamId/labels')
  @HttpCode(HttpStatus.OK)
  async findLabelsByTeam(
    @Request() req: ExpressRequest,
    @Param('teamId', ParseUUIDPipe) teamId: string,
  ) {
    return this.labelsService.findLabelsByTeam(await this.getUser(req), teamId);
  }

  @Put('labels/:id')
  @HttpCode(HttpStatus.OK)
  async updateLabel(
    @Request() req: ExpressRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateLabelDto,
  ) {
    return this.labelsService.updateLabel(await this.getUser(req), id, dto);
  }

  @Delete('labels/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLabel(
    @Request() req: ExpressRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.labelsService.deleteLabel(await this.getUser(req), id);
  }

  @Post('tasks/:taskId/labels')
  @HttpCode(HttpStatus.CREATED)
  async addTaskLabel(
    @Request() req: ExpressRequest,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body('labelId', ParseUUIDPipe) labelId: string,
  ) {
    await this.labelsService.addTaskLabel(await this.getUser(req), taskId, labelId);
  }

  @Delete('tasks/:taskId/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTaskLabel(
    @Request() req: ExpressRequest,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ) {
    await this.labelsService.removeTaskLabel(await this.getUser(req), taskId, labelId);
  }
}
