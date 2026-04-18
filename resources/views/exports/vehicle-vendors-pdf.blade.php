<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Vehicle Vendors</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #222; }
        h2 { margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; vertical-align: top; }
        th { background: #f3f4f6; }
    </style>
</head>
<body>
    <h2>Vehicle Vendors Info</h2>
    <table>
        <thead>
            <tr>
                <th>S.NO</th>
                <th>COMPANY</th>
                <th>CONTACT PERSON</th>
                <th>MOBILE</th>
                <th>DATE OF CONTRACT</th>
                <th>CONTRACT DOC</th>
                <th>ADDRESS</th>
                <th>IS ACTIVE</th>
            </tr>
        </thead>
        <tbody>
            @forelse($vendors as $index => $vendor)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>-</td>
                    <td>{{ $vendor->contact_person }}</td>
                    <td>{{ $vendor->mobile_number }}</td>
                    <td>{{ optional($vendor->date_of_contract)->format('d-m-Y') }}</td>
                    <td>{{ $vendor->contract_document ? 'Yes' : '-' }}</td>
                    <td>{{ $vendor->address }}</td>
                    <td>{{ $vendor->status === 'active' ? 'Active' : ucfirst(str_replace('_', ' ', $vendor->status)) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8">No vehicle vendors found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>

