<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dispatches</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #222; }
        h2 { margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; vertical-align: top; }
        th { background: #f3f4f6; }
        .muted { color: #6b7280; }
    </style>
</head>
<body>
    <h2>Dispatches</h2>
    <table>
        <thead>
            <tr>
                <th>S.NO</th>
                <th>ID</th>
                <th>JOB TYPE</th>
                <th>JOB NUMBER</th>
                <th>CONTAINER</th>
                <th>DRIVER</th>
                <th>VEHICLE</th>
                <th>STATUS</th>
                <th>DISPATCHED AT</th>
                <th>COMPLETED AT</th>
                <th>NOTES</th>
            </tr>
        </thead>
        <tbody>
            @forelse($dispatches as $index => $dispatch)
                @php
                    $queue = $dispatch->jobQueue;
                    $jobable = $queue?->jobable;
                    $typeKey = $jobTypeKey($queue?->jobable_type);
                    $containerKey = ($typeKey && $queue?->jobable_id) ? ($typeKey . ':' . $queue->jobable_id) : null;
                    $containerNumber = $containerKey ? ($containersByKey[$containerKey] ?? null) : null;
                    $driver = $dispatch->driverVehicleAssignment?->driver?->name
                        ?? $dispatch->driverVehicleAssignment?->driver?->driver_code;
                    $vehicle = $dispatch->driverVehicleAssignment?->vehicle?->registration_no;
                @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $dispatch->id }}</td>
                    <td>{{ $jobTypeLabel($queue?->jobable_type) }}</td>
                    <td>{{ $jobable?->job_number ?? $jobable?->job_no ?? '-' }}</td>
                    <td>{{ $containerNumber ?? '-' }}</td>
                    <td>{{ $driver ?? '-' }}</td>
                    <td>{{ $vehicle ?? '-' }}</td>
                    <td>{{ $dispatch->status ?? '-' }}</td>
                    <td>{{ optional($dispatch->dispatched_at)->format('Y-m-d H:i') ?? '-' }}</td>
                    <td>{{ optional($dispatch->completed_at)->format('Y-m-d H:i') ?? '-' }}</td>
                    <td>{{ $dispatch->notes ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="11" class="muted">No dispatches found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>

