<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Company;
use App\Models\Pic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AgentSeeder extends Seeder
{
    /**
     * Run the seeder.
     * 
     * Usage:
     *   php artisan db:seed --class=AgentSeeder
     *   php artisan db:seed --class=AgentSeeder -- --email=pic@example.com
     */
    public function run(): void
    {
        $email = $this->command->ask('Enter PIC email (leave empty for first company)', '');
        
        if ($email) {
            $pic = Pic::where('email', $email)->first();
            if (!$pic) {
                $this->command->error("PIC with email '{$email}' not found.");
                return;
            }
            $company = $pic->company;
            $this->command->info("Seeding agents for PIC: {$pic->name} ({$pic->email})");
        } else {
            $company = Company::first();
        }
        
        if (!$company) {
            $this->command->error('No company found. Please create a company first.');
            return;
        }
        
        $this->command->info("Company: {$company->name} (ID: {$company->id})");

        // First names (A-Z, multiple per letter)
        $firstNames = [
            // A
            'Ahmad', 'Adi', 'Agus', 'Andi', 'Arif', 'Ayu', 'Anisa', 'Asep', 'Aisyah', 'Alya',
            // B
            'Budi', 'Bambang', 'Bayu', 'Bagus', 'Bella', 'Bunga', 'Bintang',
            // C
            'Cahya', 'Citra', 'Chandra', 'Cindy',
            // D
            'Dewi', 'Dian', 'Dimas', 'Doni', 'Dwi', 'Dinda', 'Deni', 'Dian',
            // E
            'Eko', 'Edi', 'Endang', 'Erna', 'Evan', 'Elsa',
            // F
            'Fitri', 'Fajar', 'Faisal', 'Farhan', 'Feri', 'Fina', 'Firman',
            // G
            'Gunawan', 'Galih', 'Gilang', 'Gita', 'Guntur',
            // H
            'Hendra', 'Hadi', 'Hasan', 'Heru', 'Hana', 'Helmi', 'Herman',
            // I
            'Indah', 'Irfan', 'Iwan', 'Ika', 'Imam', 'Intan', 'Ilham',
            // J
            'Joko', 'Joni', 'Jaya', 'Jihan', 'Johan', 'Julia',
            // K
            'Kartika', 'Kurnia', 'Kiki', 'Kevin', 'Karina', 'Kusuma',
            // L
            'Lukman', 'Lina', 'Lestari', 'Luki', 'Laila', 'Lutfi',
            // M
            'Maya', 'Muhammad', 'Mega', 'Mira', 'Mulyadi', 'Melani', 'Maulana', 'Miftah',
            // N
            'Nugroho', 'Nadia', 'Nia', 'Nanda', 'Novi', 'Nur', 'Naufal', 'Nabila',
            // O
            'Oktavia', 'Omar', 'Oki', 'Olivia',
            // P
            'Putra', 'Putri', 'Prasetyo', 'Pandu', 'Prima', 'Prita',
            // Q
            'Qori',
            // R
            'Rizky', 'Rina', 'Rudi', 'Ratna', 'Reza', 'Rani', 'Rahmat', 'Rini', 'Ridwan',
            // S
            'Siti', 'Surya', 'Sari', 'Sinta', 'Sigit', 'Sandi', 'Setiawan', 'Siska', 'Suci',
            // T
            'Taufik', 'Tri', 'Tono', 'Tina', 'Teguh', 'Tiara', 'Tomi',
            // U
            'Umar', 'Umi', 'Udin', 'Utami',
            // V
            'Vina', 'Vera', 'Vivi', 'Vicky',
            // W
            'Wahyu', 'Wati', 'Wawan', 'Wulan', 'Widya', 'Wira', 'Wisnu',
            // X
            'Xena', 'Xavier',
            // Y
            'Yusuf', 'Yani', 'Yudi', 'Yoga', 'Yanti', 'Yolanda', 'Yuda',
            // Z
            'Zahra', 'Zaki', 'Zulfa', 'Zainab'
        ];
        
        // Last names pool (expanded)
        $lastNames = [
            'Pratama', 'Santoso', 'Wibowo', 'Kusuma', 'Permata',
            'Hidayat', 'Ramadhan', 'Anggraini', 'Lestari', 'Prasetyo',
            'Handayani', 'Susanto', 'Sari', 'Hakim', 'Maulana',
            'Nurhaliza', 'Amalia', 'Fauzi', 'Wijaya', 'Saputra',
            'Setiawan', 'Nugroho', 'Utomo', 'Suryadi', 'Hartono',
            'Sugiarto', 'Budiman', 'Firmansyah', 'Kurniawan', 'Wahyudi',
            'Purnomo', 'Haryanto', 'Sutrisno', 'Mulyadi', 'Supriyadi',
            'Rahayu', 'Widodo', 'Suryanto', 'Hermawan', 'Gunawan',
            'Syahputra', 'Putra', 'Perdana', 'Mahendra', 'Aditya',
            'Nurhadi', 'Fadillah', 'Syahreza', 'Anggara', 'Pamungkas'
        ];
        
        // Areas pool
        $areasPool = [
            ['Jakarta Pusat'], ['Jakarta Barat'], ['Jakarta Selatan'], 
            ['Jakarta Timur'], ['Jakarta Utara'], ['Tangerang'],
            ['Bekasi'], ['Depok'], ['Bogor'], ['Tangerang Selatan'],
            ['Jakarta Pusat', 'Jakarta Barat'], ['Jakarta Selatan', 'Jakarta Timur'],
            ['Tangerang', 'Tangerang Selatan'], ['Depok', 'Bogor'], ['Bekasi', 'Jakarta Timur']
        ];

        $password = Hash::make('123123');
        $ktpPhoto = 'agents/ktp/seeder-ktp.jpg'; // Place your KTP image at storage/app/public/agents/ktp/seeder-ktp.jpg
        $phoneBase = '08123400'; // Last 5 digits reserved for counter (00001-99999)
        
        // Find the next available counter
        $lastAgent = Agent::where('phone', 'like', $phoneBase . '%')
            ->orderBy('phone', 'desc')
            ->first();
        
        $counter = 1;
        if ($lastAgent) {
            $lastCounter = (int) substr($lastAgent->phone, -5);
            $counter = $lastCounter + 1;
        }
        
        $count = 20; // Number of agents to create
        $created = 0;
        
        for ($i = 0; $i < $count; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $name = $firstName . ' ' . $lastName;
            $phone = $phoneBase . str_pad($counter, 5, '0', STR_PAD_LEFT);
            $areas = $areasPool[array_rand($areasPool)];
            $nik = '32' . str_pad($counter, 14, '0', STR_PAD_LEFT);
            
            Agent::create([
                'company_id' => $company->id,
                'name' => $name,
                'phone' => $phone,
                'email' => strtolower(str_replace(' ', '.', $name)) . $counter . '@example.com',
                'password' => $password,
                'nik' => $nik,
                'ktp_photo' => $ktpPhoto,
                'address' => 'Jl. Contoh No. ' . $counter . ', Indonesia',
                'areas' => $areas,
                'qr_code' => Agent::generateQrCode($company, $name),
                'status' => $i % 5 === 0 ? 'inactive' : 'active', // 4 active, 1 inactive pattern
            ]);
            
            $counter++;
            $created++;
        }
        
        $this->command->info("Successfully created {$created} agents.");
        $this->command->info("Phone range: {$phoneBase}XXXXX (last 5 digits as counter)");
        $this->command->info("Password for all agents: 123123");
    }
}
