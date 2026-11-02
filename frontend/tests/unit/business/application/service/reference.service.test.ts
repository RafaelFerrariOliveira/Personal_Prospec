import { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { http } from '@axios/axios.instance';
import { ReferenceService } from '@application/service/reference.service';

const response = (data: unknown): AxiosResponse => ({
   data,
   status: 200,
   statusText: '',
   headers: {},
   config: {} as AxiosResponse['config'],
});

const page = {
   items: [{ code: '7107', name: 'SAO PAULO' }],
   totalCount: 1,
   pageNumber: 1,
   pageSize: 30,
   totalPages: 1,
};

describe('ReferenceService', () => {
   afterEach(() => {
      vi.restoreAllMocks();
   });

   it('getStates devolve as UF validadas', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValue(response([{ code: 'SP', name: 'SAO PAULO' }]));

      // Act
      const result = await new ReferenceService().getStates();

      // Assert
      expect(result).toEqual([{ code: 'SP', name: 'SAO PAULO' }]);
      expect(get).toHaveBeenCalledWith('Reference/get_states_reference', {});
   });

   it('getStates devolve lista vazia quando o corpo não passa no Zod', async () => {
      // Arrange
      vi.spyOn(http, 'get').mockResolvedValue(response([{ code: 1 }]));

      // Act
      const result = await new ReferenceService().getStates();

      // Assert
      expect(result).toEqual([]);
   });

   it('getStates rejeita em erro e repassa o signal', async () => {
      // Arrange
      const { signal } = new AbortController();
      const get = vi.spyOn(http, 'get').mockRejectedValue(new AxiosError('falha'));

      // Act
      const result = new ReferenceService().getStates({ signal });

      // Assert
      await expect(result).rejects.toBeInstanceOf(AxiosError);
      expect(get.mock.calls[0]?.[1]).toEqual({ signal });
   });

   it('getMunicipalities envia a query com busca e devolve a página', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValue(response(page));
      const query = { state: 'SP', search: 'sao', pageNumber: 1, pageSize: 30 };

      // Act
      const result = await new ReferenceService().getMunicipalities(query);

      // Assert
      expect(result).toEqual(page);
      expect(get).toHaveBeenCalledWith('Reference/get_municipalities_reference', { params: query });
   });

   it('getMunicipalities omite search vazio e repassa o signal', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValue(response(page));
      const { signal } = new AbortController();

      // Act
      await new ReferenceService().getMunicipalities(
         { state: 'SP', search: '', pageNumber: 2, pageSize: 30 },
         { signal },
      );

      // Assert
      expect(get.mock.calls[0]?.[1]).toEqual({ params: { state: 'SP', pageNumber: 2, pageSize: 30 }, signal });
   });

   it('getMunicipalities devolve página vazia quando o corpo é inválido e rejeita em erro', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValueOnce(response({ items: 'x' }));

      // Act
      const invalid = await new ReferenceService().getMunicipalities({ state: 'SP', pageNumber: 1, pageSize: 30 });
      get.mockRejectedValueOnce(new AxiosError('falha'));
      const failed = new ReferenceService().getMunicipalities({ state: 'SP', pageNumber: 1, pageSize: 30 });

      // Assert
      expect(invalid.items).toEqual([]);
      await expect(failed).rejects.toBeInstanceOf(AxiosError);
   });

   it('searchCnae envia o termo, valida e repassa o signal', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValue(response([{ code: '6201501', description: 'Software' }]));
      const { signal } = new AbortController();

      // Act
      const result = await new ReferenceService().searchCnae('6201', { signal });

      // Assert
      expect(result).toEqual([{ code: '6201501', description: 'Software' }]);
      expect(get).toHaveBeenCalledWith('Reference/search_cnae_reference', { params: { search: '6201' }, signal });
   });

   it('searchCnae devolve lista vazia com corpo inválido e rejeita em erro', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValueOnce(response('x'));

      // Act
      const invalid = await new ReferenceService().searchCnae('6201');
      get.mockRejectedValueOnce(new AxiosError('falha'));
      const failed = new ReferenceService().searchCnae('6201');

      // Assert
      expect(invalid).toEqual([]);
      await expect(failed).rejects.toBeInstanceOf(AxiosError);
   });
});
