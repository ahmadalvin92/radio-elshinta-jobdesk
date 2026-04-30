<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Rekap Jobdesk Elshinta</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #172033; font-size: 11px; }
        .header { width: 100%; margin-bottom: 14px; }
        .logo { width: 78px; height: auto; }
        .title { padding-left: 12px; }
        h1 { margin: 0 0 4px; color: #0b63ce; font-size: 22px; }
        p { margin: 0; color: #64748b; }
        .meta { margin-bottom: 14px; }
        .summary { width: 100%; margin-bottom: 14px; border-collapse: separate; border-spacing: 8px 0; }
        .summary td { border: 1px solid #d7deea; border-radius: 6px; padding: 9px; }
        .summary span { color: #64748b; display: block; }
        .summary strong { color: #0b63ce; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0a2a55; color: #ffffff; text-align: left; }
        th, td { border: 1px solid #d7deea; padding: 8px; vertical-align: top; }
        .status { font-weight: bold; text-transform: uppercase; }
    </style>
</head>
<body>
    <table class="header">
        <tr>
            <td style="width: 90px; border: 0; padding: 0;">
                @if (file_exists($logoPath))
                    <img class="logo" src="{{ $logoPath }}" alt="Radio Elshinta">
                @endif
            </td>
            <td class="title" style="border: 0; padding: 0;">
                <h1>Rekap Jobdesk Radio Elshinta</h1>
                <p>{{ $periodLabel }}</p>
            </td>
        </tr>
    </table>
    <p class="meta">Dicetak pada {{ now()->format('d/m/Y H:i') }} | Develop by Alvin dan IT Support Tim 2026 with love</p>

    <table class="summary">
        <tr>
            <td><span>Total</span><strong>{{ $stats['total'] }}</strong></td>
            <td><span>Pending</span><strong>{{ $stats['pending'] }}</strong></td>
            <td><span>Approved</span><strong>{{ $stats['approved'] }}</strong></td>
            <td><span>Rejected</span><strong>{{ $stats['rejected'] }}</strong></td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Hari</th>
                <th>Jam</th>
                <th>User / Komputer</th>
                <th>Jenis</th>
                <th>Keterangan</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($jobs as $job)
                <tr>
                    <td>{{ optional($job->job_date)->format('d/m/Y') }}</td>
                    <td>{{ $job->day_name }}</td>
                    <td>{{ $job->start_time }} - {{ $job->end_time }}</td>
                    <td>{{ $job->computerAsset?->pc_name }}</td>
                    <td>{{ $job->work_type }}</td>
                    <td>{{ $job->description }}</td>
                    <td class="status">{{ $job->status }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">Belum ada data jobdesk.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
