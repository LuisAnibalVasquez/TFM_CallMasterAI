import { Inject, Injectable } from "@nestjs/common";
import { Tenant } from "../../domain/entities/tenant.entity";
import { ITenantRepository } from "../../domain/ports/tenant-repository.port";

export interface PaginatedResult {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListTenantsUseCase {
  constructor(
    @Inject("ITenantRepository")
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(page = 1, limit = 20): Promise<PaginatedResult> {
    const { data, total } = await this.tenantRepository.findAll({
      page,
      limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
