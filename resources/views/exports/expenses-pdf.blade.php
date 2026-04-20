<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Expenses</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #222; }
        h2 { margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; vertical-align: top; }
        th { background: #f3f4f6; }
        .muted { color: #6b7280; }
        .right { text-align: right; }
    </style>
</head>
<body>
    <h2>Expenses</h2>
    <table>
        <thead>
            <tr>
                <th>S.NO</th>
                <th>DATE</th>
                <th>TITLE</th>
                <th>CATEGORY</th>
                <th>COMPANY</th>
                <th>BRANCH</th>
                <th class="right">AMOUNT</th>
                <th>CURRENCY</th>
                <th>PAYMENT</th>
                <th>REFERENCE</th>
                <th>STATUS</th>
            </tr>
        </thead>
        <tbody>
            @forelse($expenses as $index => $expense)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ optional($expense->expense_date)->format('Y-m-d') ?? '-' }}</td>
                    <td>{{ $expense->title }}</td>
                    <td>{{ $expense->expenseCategory?->name ?? '-' }}</td>
                    <td>{{ $expense->company?->name ?? '-' }}</td>
                    <td>{{ $expense->branch?->name ?? '-' }}</td>
                    <td class="right">{{ number_format((float) $expense->amount, 2) }}</td>
                    <td>{{ $expense->currency ?? '-' }}</td>
                    <td>{{ $expense->payment_method ?? '-' }}</td>
                    <td>{{ $expense->reference_no ?? '-' }}</td>
                    <td>{{ $expense->status ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="11" class="muted">No expenses found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>

