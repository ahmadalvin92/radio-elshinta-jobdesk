<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('computer_assets', function (Blueprint $table): void {
            $table->string('pc_name')->after('id');
            $table->string('ip_address')->nullable()->after('pc_name');
            $table->string('windows_version')->nullable()->after('ip_address');
            $table->text('processor')->nullable()->after('windows_version');
            $table->boolean('active')->default(true)->after('processor');
        });
    }

    public function down(): void
    {
        Schema::table('computer_assets', function (Blueprint $table): void {
            $table->dropColumn([
                'pc_name',
                'ip_address',
                'windows_version',
                'processor',
                'active',
            ]);
        });
    }
};
