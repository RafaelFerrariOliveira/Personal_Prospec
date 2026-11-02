import { z } from 'zod';

export const ZApiBooleanResponse = z.boolean();

/**
 * Id do backend (.NET Guid). Usa z.guid() (formato 8-4-4-4-12 hexadecimal) e não z.uuid():
 * o EF Core gera Guid sequencial nas chaves com ValueGeneratedOnAdd, que nem sempre respeita
 * a variante RFC 9562 exigida por z.uuid(), e o parse falharia para um id válido do banco.
 */
export const ZGuid = z.guid();

/** Metadados do PageList do backend: { items, totalCount, pageNumber, pageSize, totalPages }. */
const ZPageMetadataSchema = z.object({
   totalCount: z.number().int().nonnegative(),
   pageNumber: z.number().int().nonnegative(),
   pageSize: z.number().int().nonnegative(),
   totalPages: z.number().int().nonnegative(),
});

type TPaginatedResponseShape<TItem extends z.ZodType> = typeof ZPageMetadataSchema.shape & {
   items: z.ZodArray<TItem>;
};

/** Schema padrão de página: nunca reinventar o shape por feature. */
export const createPaginatedResponseSchema = <TItem extends z.ZodType>(
   itemSchema: TItem,
): z.ZodObject<TPaginatedResponseShape<TItem>> =>
   z.object({ ...ZPageMetadataSchema.shape, items: z.array(itemSchema) });

export type TPaginatedResponse<TItem> = z.infer<typeof ZPageMetadataSchema> & { items: TItem[] };

export const createEmptyPaginatedResponse = <TItem>(): TPaginatedResponse<TItem> => ({
   items: [],
   totalCount: 0,
   pageNumber: 0,
   pageSize: 0,
   totalPages: 0,
});
