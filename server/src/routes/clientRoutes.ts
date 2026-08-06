import { Router, Request, Response } from 'express';
import { DurableStore } from '../config/durableStore.js';
import { calculateClientCompliance } from '../utils/compliance.js';

const router = Router();

// GET /api/clients - Get coach's client roster with real compliance metrics
router.get('/', async (req: Request, res: Response) => {
  try {
    const { coachId } = req.query;
    const allUsers = DurableStore.getUsers();
    const allLogs = DurableStore.getLogs();

    let clients = allUsers.filter((u) => u.role === 'client');

    // Filter by assigned coach if provided
    if (coachId && typeof coachId === 'string') {
      clients = clients.filter((c) => c.coachId === coachId);
    }

    const roster = clients.map((client) => {
      const clientIdStr = String(client._id);
      const clientLogs = allLogs.filter((l) => l.clientId === clientIdStr);

      const compliance = calculateClientCompliance(clientLogs);
      const sortedLogs = clientLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latestLog = sortedLogs[0];

      // Find assigned coach name if any
      let coachName: string | undefined = undefined;
      if (client.coachId) {
        const coach = allUsers.find((u) => u._id === client.coachId);
        if (coach) coachName = coach.name;
      }

      const { passwordHash, passwordSalt, ...safeClient } = client;

      return {
        ...safeClient,
        coachName,
        compliance,
        latestLogDate: latestLog ? latestLog.date : null,
        totalLogsSubmitted: clientLogs.length,
      };
    });

    // Sort: needs attention first (red -> yellow -> green), then alphabetical
    const sorted = roster.sort((a, b) => {
      const rank = { red: 0, yellow: 1, green: 2 };
      return rank[a.compliance.tier] - rank[b.compliance.tier];
    });

    return res.json({ success: true, data: sorted });
  } catch (error: any) {
    console.error('Fetch clients error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/clients/:id - Get specific client detail with real logs and coach info
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = DurableStore.findUserById(id);

    if (!client) {
      return res.status(404).json({ success: false, message: 'Athlete not found' });
    }

    const clientLogs = DurableStore.findLogsByClient(id);
    const compliance = calculateClientCompliance(clientLogs);

    let coachInfo = null;
    if (client.coachId) {
      const coach = DurableStore.findUserById(client.coachId);
      if (coach) {
        coachInfo = {
          _id: coach._id,
          name: coach.name,
          email: coach.email,
          avatarUrl: coach.avatarUrl,
          fitnessGoal: coach.fitnessGoal,
          coachCode: coach.coachCode,
        };
      }
    }

    const { passwordHash, passwordSalt, ...safeClient } = client;

    return res.json({
      success: true,
      data: {
        ...safeClient,
        coach: coachInfo,
        compliance,
        logs: clientLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
