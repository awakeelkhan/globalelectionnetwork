import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const electionId     = searchParams.get('electionId');
    const constituencyId = searchParams.get('constituencyId');
    const verified       = searchParams.get('verified');
    const flagged        = searchParams.get('flagged');

    let sql = `
      SELECT r.*, c.name AS constituency_name, c.code AS constituency_code,
             p.color AS party_color, p.short_name AS party_short
      FROM result_entries r
      LEFT JOIN constituencies c ON c.id = r.constituency_id
      LEFT JOIN parties p ON p.id = r.party_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let i = 1;
    if (electionId)     { sql += ` AND r.election_id=$${i++}`;     params.push(electionId); }
    if (constituencyId) { sql += ` AND r.constituency_id=$${i++}`; params.push(constituencyId); }
    if (verified)       { sql += ` AND r.verified=$${i++}`;        params.push(verified === 'true'); }
    if (flagged)        { sql += ` AND r.flagged=$${i++}`;         params.push(flagged === 'true'); }
    sql += ' ORDER BY r.submitted_at DESC';

    const results = await query(sql, params);
    return NextResponse.json({ results });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const [row] = await query(`
      INSERT INTO result_entries
        (candidate_id, candidate_name, party_id, polling_station_id, polling_station_name,
         constituency_id, election_id, votes, submitted_by, submitted_at, observer_id,
         district_name, total_cast_votes, is_winner, is_runner_up)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *
    `, [b.candidateId ?? null, b.candidateName, b.partyId ?? null, b.pollingStationId ?? null,
        b.pollingStationName ?? '', b.constituencyId ?? null, b.electionId,
        b.votes, b.submittedBy ?? 'admin', b.submittedAt ?? new Date().toISOString(), b.observerId ?? null,
        b.districtName ?? null, b.totalCastVotes ?? null, b.isWinner ?? false, b.isRunnerUp ?? false]);

    if (b.candidateId) {
      await query(
        'UPDATE candidates SET votes = votes + $1 WHERE id = $2',
        [b.votes, b.candidateId]
      );
    }

    return NextResponse.json({ result: row }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
