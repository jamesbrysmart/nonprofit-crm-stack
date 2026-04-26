import { describe, expect, it } from 'vitest';
import { findInstalledApplication, getCoreClient } from './test-helpers';

describe('App installation', () => {
  it('should find the installed app in the applications list', async () => {
    const app = await findInstalledApplication();

    expect(app).toBeDefined();
  });
});

describe('CoreApiClient', () => {
  it('should support CRUD on standard objects', async () => {
    const client = getCoreClient();

    const created = await client.mutation({
      createNote: {
        __args: { data: { title: 'Integration test note' } },
        id: true,
      },
    });
    expect(created.createNote.id).toBeDefined();

    await client.mutation({
      destroyNote: {
        __args: { id: created.createNote.id },
        id: true,
      },
    });
  });
});
