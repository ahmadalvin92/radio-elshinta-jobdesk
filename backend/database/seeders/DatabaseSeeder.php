<?php

namespace Database\Seeders;

use App\Models\ComputerAsset;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

        User::query()
            ->whereIn('email', ['admin@elshinta.local', 'test@example.com'])
            ->delete();

        foreach (['Alvin', 'Zulhendri', 'Badru', 'Saiful', 'Faiz'] as $adminName) {
            $admin = User::updateOrCreate(
                ['email' => Str::slug($adminName). '@elshinta.local'],
                [
                    'name' => $adminName,
                    'password' => 'admin123',
                ],
            );

            $admin->syncRoles([$adminRole]);
        }

        $assets = [
            ['Asep (laptop)', '67', 'Win 11', null],
            ['User (Mushli)', '44', 'Win 10 Pro 20H2', 'intel Pentium G3240 @3.1GHz 3.10GHz'],
            ['Administrator (Rohmat)', '30', 'Win 10 Pro 20H2', 'Intel Core i3-3240 @ 3.40GHz'],
            ['Novel', '46', 'Win 10 Pro 22H2', 'Intel Core i3-2310 3.40GHz'],
            ['AAN', '150', 'Win 10 Pro 22H2', 'Intel Core i3-3220 CPU @ 3.30GHz'],
            ['Ihda Urwatul', '69', 'Win 10 Pro 20H2', 'Intel Core i7-6700 CPU @ 3.40GHz'],
            ['Calista', '38', 'Win 10 Pro 22H2', 'Intel Pentium Gold G5400 3.70GHz'],
            ['Rinal', '28', 'Win 10 Pro 22H2', 'Intel Core i3-2130 3.40GHz'],
            ['Medsos 2', '138', 'Win 11 Pro 25H2', 'Intel Core i7-10700F CPU @ 2.90GHz'],
            ['Medsos 1 (laptop)', '57', 'Win 10 Pro', 'Intel Core i3-2330M CPU @ 2.20GHz'],
            ['Anchor Studio 2', '5', 'Win 10 Pro 22H2', 'Intel Core i3-3240 CPU @ 3.40GHz'],
            ['Administrator OBS', '9', 'Win 11 Pro 23H2', 'Intel Core i7-10700 CPU @ 2.90GHz'],
            ['Amin', '228', 'Win 10 Pro 22H2', 'Intel Core i3-4160 3.60GHz'],
            ['WA Call LS', '83', 'Win 10 Pro 22H2', 'i5-6400 CPU @ 2.70GHz'],
            ['Supri (so_pray)', '24', 'Win 10 Pro 22H2', 'Intel Core i3-3320 3.30GHz'],
            ['Lily', '29', 'Win 10 Pro 22H2', 'Intel Core i3-2130 3.40GHz'],
            ['Shanty', '1101', 'Win 10 Pro 22H2', 'Intel Core i3-4170 3.70GHz'],
            ['Listener 2', '8', 'Win 10 Pro 22H2', 'i7-8700 CPU @ 3.20GHz'],
            ['Ali (HRD1)', '32', 'Win 10 Pro', 'Intel Core i3-3220 3.30GHz'],
            ['Listener 4', '54', 'Win 10 Pro 22H2', 'i3-4170 CPU @ 3.70GHz'],
            ['Medsos 3', '52', 'Win 10 Pro', 'Intel Core i7-8700 CPU @ 3.20GHz'],
            ['PC_Endang', '66', 'Win 10 Pro 22H2', 'Intel Core i3-2120 3.30GHz'],
            ['Asrofi', '38', 'Win 10 Pro 22H2', 'Intel Core i3-3220 CPU @ 3.30GHz'],
            ['Remon', '1102', 'Win 10 Pro 22H2', 'Intel Core i3-4160 3.60GHz'],
            ['Newsflash Studio 2', '33', 'Win 10 Pro 22H2', 'i3 CPU 550 @ 3.20GHz'],
            ['Administrator Teknik Audiologer1', '22', 'Win 10 Pro 22H2', 'Intel Core i3-2130 3.40GHz'],
            ['User (Teknik)', '2', 'Win 10 Pro 22H2', 'Intel Pentium CPU G3240 3.10GHz'],
            ['Korda', '74', 'Win 10 Pro 22H2', 'i3-4730 CPU @ 3.70GHz'],
            ['Produser', '20', 'Win 10 Pro 22H2', 'i3-4130 CPU @ 3.40GHz'],
            ['Produser-2', '25', 'Win 10 Pro 22H2', 'i3-4150 CPU @ 3.50GHz'],
            ['Faris produksi', '78', 'Win 10 Enterprise LTSC 21H2', 'i7-6700K CPU @ 4.00GHz'],
            ['Pak Haryo (Pempret', '233DHCP', 'Win 10 Pro 22H2', 'Intel Pentium Gold G5400 3.70GHz'],
            ['BOTH 1', '39', 'Win 7 Ultimate Versi 6.1', 'i3-3240 CPU @ 3.40GHz(4CPUs), ~3.4GHz'],
            ['BOTH 2', '21', 'Win 7 Ultimate Versi 6.1', 'i3-3240 CPU @ 3.40GHz(4CPUs), ~3.4GHz'],
            ['Administrator (Operator)', '71', 'Win 10 Pro 22H2', 'i7-7700K CPU @ 4.20GHz 4.20GHz'],
            ['PC MIXXER 1', '14', 'Win 10 Pro 22H2', 'i7-7700K CPU @ 4.20GHz 4.20GHz'],
            ['Anchor 1', '4', 'Win 11 Pro 25H2', 'i7-10700 CPU @ 2.90GHz'],
            ['Newsflash', '26', 'Win 10 Pro 22H2', 'i7-9700 CPU @ 3.00GHz'],
            ['Tiktok Live', '17', 'Win 11 Pro 25H2', 'i7-12700F 2.10GHz'],
            ['WA Call Redaksi', '34', 'Win 11 Pro 23H2', 'i5-7500 CPU @ 3.40GHz 3.41GHz'],
            ['Korlip', '90', 'Win 10 Pro 22H2', 'i3-4170 CPU @ 3.70GHz 3.70GHz'],
            ['Listener-3', '31', 'Win 10 Pro 22H2', 'Intel Core i3-4170 3.70GHz'],
            ['Zukri', '75', 'Win 10 Pro 22H2', 'Intel Core i3-2130 3.40GHz'],
            ['Yanti', '84', 'Win 10 Pro 22H2', 'Intel Core i3-3220 3.20GHz'],
            ['Oddy', '86', 'Win 10 Pro 22H2', 'Intel Core i3-2310 3.40GHz'],
            ['Saiful', '7', 'Win 10 Pro 22H2', 'i5-7500 CPU @ 3.40GHz 3.41GHz'],
            ['Badru', '221', 'Win 10 Pro 22H2', 'Intel Core i3-2130 3.40GHz'],
            ['Zulhendri', '201', 'Win 10 Pro 22H2', 'Intel Core i3-2130 3.40GHz'],
            ['Server Streaming', '202.137.4.147', 'Win 10 Pro 22H2', 'Intel Core i3-2130 3.40GHz'],
            ['Audiologger 2', '39', 'Win 7 Ultimate Versi 6.1', 'Intel Core i3-2130 3.40GHz'],
            ['Audiologger 3', '40', 'Win 10 Pro 22H2', 'Intel Core i3-2130 3.40GHz'],
            ['PC Server Kontributor', '143', 'Linux', 'INTEL XEON E5-2650v3 2.3GHz'],
            ['PC Server Kontributor', '115', 'Linux', 'INTEL XEON E5-2650v3 2.3GHz'],
            ['PC sender Audio To streaming', '76', 'Win 7 Professional SP1', 'INTEL XEON E5-1620v2 3.7GHz'],
            ['PC HP Pantau Audio streaming', '70', 'Win 10 Pro 22H2', 'INTEL XEON E5-1620v2 3.7GHz'],
            ['PC Jamal', '43', 'Win 11 Pro 25H2', 'I7-14700K (3.40 GHz)'],
        ];

        foreach ($assets as [$pcName, $ipAddress, $windowsVersion, $processor]) {
            ComputerAsset::updateOrCreate(
                [
                    'pc_name' => $pcName,
                    'ip_address' => $ipAddress,
                ],
                [
                    'windows_version' => $windowsVersion,
                    'processor' => $processor,
                    'active' => true,
                ],
            );

            $email = Str::slug($pcName). '@elshinta.local';

            if (User::where('email', $email)->role('admin')->exists()) {
                continue;
            }

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $pcName,
                    'password' => 'admin123',
                ],
            );

            $user->syncRoles([$userRole]);
        }
    }
}
