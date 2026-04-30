<?php

use App\Models\ComputerAsset;
use App\Models\DailyJob;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

function requireAdmin(Request $request): ?\Illuminate\Http\JsonResponse
{
    $actor = User::find($request->input('actor_id'));

    if (! $actor || ! $actor->hasRole('admin')) {
        return response()->json([
            'message' => 'Akses hanya untuk admin.',
        ], 403);
    }

    return null;
}

Route::get('/health', function () {
    return ['status' => 'ok'];
});

Route::post('/login', function (Request $request) {
    $data = $request->validate([
        'login' => ['required', 'string'],
        'password' => ['required', 'string'],
    ]);

    $login = mb_strtolower(trim($data['login']));

    $user = User::query()
        ->whereRaw('lower(email) = ?', [$login])
        ->orWhereRaw('lower(name) = ?', [$login])
        ->first();

    if (! $user || ! Hash::check($data['password'], $user->password)) {
        return response()->json([
            'message' => 'Nama/email atau password salah.',
        ], 422);
    }

    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'roles' => $user->getRoleNames(),
        'role' => $user->hasRole('admin') ? 'admin' : 'user',
    ];
});

Route::post('/change-password', function (Request $request) {
    $data = $request->validate([
        'user_id' => ['required', 'exists:users,id'],
        'current_password' => ['required', 'string'],
        'new_password' => ['required', 'string', 'min:6', 'confirmed'],
    ]);

    $user = User::findOrFail($data['user_id']);

    if (! Hash::check($data['current_password'], $user->password)) {
        return response()->json([
            'message' => 'Password lama salah.',
        ], 422);
    }

    $user->update([
        'password' => $data['new_password'],
    ]);

    return [
        'message' => 'Password berhasil diubah.',
    ];
});

Route::get('/users', function () {
    return User::query()
        ->select(['id', 'name', 'email'])
        ->orderBy('name')
        ->get()
        ->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->hasRole('admin') ? 'admin' : 'user',
        ]);
});

Route::post('/users', function (Request $request) {
    if ($response = requireAdmin($request)) {
        return $response;
    }

    $data = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        'role' => ['required', Rule::in(['admin', 'user'])],
        'password' => ['nullable', 'string', 'min:6'],
    ]);

    $user = User::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => $data['password'] ?? 'admin123',
    ]);

    Role::firstOrCreate(['name' => $data['role'], 'guard_name' => 'web']);
    $user->syncRoles([$data['role']]);

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $data['role'],
        'message' => 'User berhasil ditambahkan.',
    ], 201);
});

Route::put('/users/{user}', function (Request $request, User $user) {
    if ($response = requireAdmin($request)) {
        return $response;
    }

    $data = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
        'role' => ['required', Rule::in(['admin', 'user'])],
    ]);

    $user->update([
        'name' => $data['name'],
        'email' => $data['email'],
    ]);

    Role::firstOrCreate(['name' => $data['role'], 'guard_name' => 'web']);
    $user->syncRoles([$data['role']]);

    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $data['role'],
        'message' => 'User berhasil diupdate.',
    ];
});

Route::delete('/users/{user}', function (Request $request, User $user) {
    if ($response = requireAdmin($request)) {
        return $response;
    }

    if ((int) $request->input('actor_id') === $user->id) {
        return response()->json([
            'message' => 'Admin tidak bisa menghapus akun sendiri.',
        ], 422);
    }

    $user->delete();

    return [
        'message' => 'User berhasil dihapus.',
    ];
});

Route::post('/users/{user}/reset-password', function (Request $request, User $user) {
    if ($response = requireAdmin($request)) {
        return $response;
    }

    $user->update([
        'password' => 'admin123',
    ]);

    return [
        'message' => 'Password user berhasil direset ke admin123.',
    ];
});

Route::get('/computer-assets', function () {
    return ComputerAsset::query()
        ->where('active', true)
        ->orderBy('pc_name')
        ->get();
});

Route::get('/daily-jobs', function () {
    return DailyJob::query()
        ->with('computerAsset')
        ->latest('job_date')
        ->latest('id')
        ->get();
});

Route::post('/daily-jobs', function (Request $request) {
    if ($response = requireAdmin($request)) {
        return $response;
    }

    $data = $request->validate([
        'job_date' => ['required', 'date'],
        'start_time' => ['nullable', 'date_format:H:i'],
        'end_time' => ['nullable', 'date_format:H:i'],
        'computer_asset_id' => ['required', 'exists:computer_assets,id'],
        'work_type' => ['required', 'string', 'max:120'],
        'description' => ['required', 'string'],
        'admin_id' => ['nullable', 'exists:users,id'],
        'status' => ['nullable', Rule::in(['draft', 'pending'])],
    ]);

    $data['day_name'] = Carbon::parse($data['job_date'])->locale('id')->dayName;
    $data['status'] = $data['status'] ?? 'pending';

    $job = DailyJob::create($data);

    return $job->load('computerAsset');
});

Route::put('/daily-jobs/{dailyJob}', function (Request $request, DailyJob $dailyJob) {
    if ($response = requireAdmin($request)) {
        return $response;
    }

    $data = $request->validate([
        'job_date' => ['required', 'date'],
        'start_time' => ['nullable', 'date_format:H:i'],
        'end_time' => ['nullable', 'date_format:H:i'],
        'computer_asset_id' => ['required', 'exists:computer_assets,id'],
        'work_type' => ['required', 'string', 'max:120'],
        'description' => ['required', 'string'],
        'admin_id' => ['nullable', 'exists:users,id'],
        'status' => ['nullable', Rule::in(['draft', 'pending', 'approved', 'rejected'])],
    ]);

    $data['day_name'] = Carbon::parse($data['job_date'])->locale('id')->dayName;
    $data['status'] = $data['status'] ?? $dailyJob->status;

    if ($data['status'] === 'pending') {
        $data['approved_by'] = null;
        $data['approved_at'] = null;
        $data['rejected_reason'] = null;
    }

    $dailyJob->update($data);

    return $dailyJob->load('computerAsset');
});

Route::delete('/daily-jobs/{dailyJob}', function (Request $request, DailyJob $dailyJob) {
    if ($response = requireAdmin($request)) {
        return $response;
    }

    $dailyJob->delete();

    return [
        'message' => 'Jobdesk berhasil dihapus.',
    ];
});

Route::post('/daily-jobs/{dailyJob}/approve', function (DailyJob $dailyJob) {
    request()->validate([
        'approved_by' => ['nullable', 'exists:users,id'],
    ]);

    $dailyJob->update([
        'status' => 'approved',
        'approved_at' => now(),
        'approved_by' => request('approved_by'),
        'rejected_reason' => null,
    ]);

    return $dailyJob->load('computerAsset');
});

Route::post('/daily-jobs/{dailyJob}/reject', function (Request $request, DailyJob $dailyJob) {
    $data = $request->validate([
        'approved_by' => ['nullable', 'exists:users,id'],
        'rejected_reason' => ['nullable', 'string'],
    ]);

    $dailyJob->update([
        'status' => 'rejected',
        'approved_at' => null,
        'approved_by' => $data['approved_by'] ?? null,
        'rejected_reason' => $data['rejected_reason'] ?? null,
    ]);

    return $dailyJob->load('computerAsset');
});

Route::get('/daily-jobs/export-pdf', function () {
    $filters = request()->validate([
        'period' => ['nullable', Rule::in(['all', 'day', 'week', 'month'])],
        'date' => ['nullable', 'date'],
        'week' => ['nullable', 'regex:/^\d{4}-W\d{2}$/'],
        'month' => ['nullable', 'date_format:Y-m'],
    ]);

    $period = $filters['period'] ?? 'all';
    $query = DailyJob::query()->with('computerAsset');
    $periodLabel = 'Semua data';

    if ($period === 'day') {
        $date = Carbon::parse($filters['date'] ?? now());
        $query->whereDate('job_date', $date);
        $periodLabel = 'Harian - '.$date->translatedFormat('d F Y');
    }

    if ($period === 'week') {
        [$year, $week] = explode('-W', $filters['week'] ?? now()->format('o-\WW'));
        $start = Carbon::now()->setISODate((int) $year, (int) $week)->startOfWeek();
        $end = $start->copy()->endOfWeek();
        $query->whereBetween('job_date', [$start->toDateString(), $end->toDateString()]);
        $periodLabel = 'Mingguan - '.$start->translatedFormat('d M Y').' s/d '.$end->translatedFormat('d M Y');
    }

    if ($period === 'month') {
        $month = Carbon::createFromFormat('Y-m', $filters['month'] ?? now()->format('Y-m'));
        $query->whereYear('job_date', $month->year)->whereMonth('job_date', $month->month);
        $periodLabel = 'Bulanan - '.$month->translatedFormat('F Y');
    }

    $jobs = $query->latest('job_date')->latest('id')->get();
    $logoPath = public_path('logo-elshinta.png');
    $stats = [
        'total' => $jobs->count(),
        'pending' => $jobs->where('status', 'pending')->count(),
        'approved' => $jobs->where('status', 'approved')->count(),
        'rejected' => $jobs->where('status', 'rejected')->count(),
    ];

    return Pdf::loadView('pdf.daily-jobs', compact('jobs', 'logoPath', 'periodLabel', 'stats'))
        ->setPaper('a4', 'landscape')
        ->download('rekap-jobdesk-elshinta.pdf');
});
