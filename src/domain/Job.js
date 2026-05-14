// domain/Job.ts
import { randomUUID } from 'crypto';
export const toJob = (dto) => ({
    id: randomUUID(),
    fetchedAt: new Date(),
    scoringStatus: 'pending',
    ...dto,
});
//# sourceMappingURL=Job.js.map