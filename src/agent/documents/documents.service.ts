import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentDocument } from 'src/database/entities';
import { AgentContextService } from '../shared/agent-context.service';
import { UploadAgentDocumentDto } from './dto/upload-document.dto';

/** Files are uploaded to storage by the app; we only keep the URL. */
@Injectable()
export class AgentDocumentsService {
  constructor(
    @InjectRepository(AgentDocument)
    private readonly documentRepo: Repository<AgentDocument>,
    private readonly context: AgentContextService,
  ) {}

  async upload(userId: string, dto: UploadAgentDocumentDto) {
    const agent = await this.context.requireAgent(userId);

    const existing = await this.documentRepo.findOne({
      where: { agentId: agent.id, documentType: dto.documentType },
      order: { createdAt: 'DESC' },
    });

    if (existing?.verificationStatus === 'VERIFIED') {
      throw new ConflictException(
        `${dto.documentType} is already verified and cannot be replaced`,
      );
    }

    const document =
      existing ??
      this.documentRepo.create({
        agentId: agent.id,
        documentType: dto.documentType,
      });

    document.documentNumber = dto.documentNumber ?? null;
    document.documentUrl = dto.documentUrl;
    // A fresh upload always goes back into the admin review queue.
    document.verificationStatus = 'PENDING';
    document.verifiedAt = null;

    return this.toResponse(await this.documentRepo.save(document));
  }

  async list(userId: string) {
    const agent = await this.context.requireAgent(userId);
    const documents = await this.documentRepo.find({
      where: { agentId: agent.id },
      order: { createdAt: 'DESC' },
    });
    return { items: documents.map((document) => this.toResponse(document)) };
  }

  async remove(userId: string, id: string) {
    const agent = await this.context.requireAgent(userId);

    const document = await this.documentRepo.findOne({
      where: { id, agentId: agent.id },
    });
    if (!document) throw new NotFoundException('Document not found');

    if (!['PENDING', 'REJECTED'].includes(document.verificationStatus)) {
      throw new BadRequestException(
        'Only pending or rejected documents can be deleted',
      );
    }

    await this.documentRepo.remove(document);
    return { deleted: true };
  }

  private toResponse(document: AgentDocument) {
    return {
      id: document.id,
      documentType: document.documentType,
      documentNumber: document.documentNumber,
      documentUrl: document.documentUrl,
      verificationStatus: document.verificationStatus,
      verifiedAt: document.verifiedAt,
      createdAt: document.createdAt,
    };
  }
}
