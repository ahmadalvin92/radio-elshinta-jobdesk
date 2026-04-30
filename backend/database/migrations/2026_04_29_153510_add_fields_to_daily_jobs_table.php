<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_jobs', function (Blueprint $table): void {
            $table->date('job_date')->after('id');
            $table->string('day_name')->after('job_date');
            $table->time('start_time')->nullable()->after('day_name');
            $table->time('end_time')->nullable()->after('start_time');
            $table->foreignId('computer_asset_id')->after('end_time')->constrained()->cascadeOnDelete();
            $table->foreignId('admin_id')->nullable()->after('computer_asset_id')->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->after('admin_id')->constrained('users')->nullOnDelete();
            $table->string('work_type')->after('approved_by');
            $table->text('description')->after('work_type');
            $table->string('status')->default('pending')->after('description');
            $table->timestamp('approved_at')->nullable()->after('status');
            $table->text('rejected_reason')->nullable()->after('approved_at');
        });
    }

    public function down(): void
    {
        Schema::table('daily_jobs', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('computer_asset_id');
            $table->dropConstrainedForeignId('admin_id');
            $table->dropConstrainedForeignId('approved_by');
            $table->dropColumn([
                'job_date',
                'day_name',
                'start_time',
                'end_time',
                'work_type',
                'description',
                'status',
                'approved_at',
                'rejected_reason',
            ]);
        });
    }
};
