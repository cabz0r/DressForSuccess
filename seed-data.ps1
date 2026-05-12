# Dress for Success - Seed Test Data
# Run this after the API is started on http://localhost:5000

$baseUrl = "http://localhost:5000/api"
$headers = @{ "Content-Type" = "application/json" }

function Post($path, $body) {
    try {
        $r = Invoke-RestMethod -Uri "$baseUrl/$path" -Method POST -Body ($body | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
        return $r
    } catch {
        Write-Host "  ERROR on POST $path : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Patch($path, $body) {
    try {
        $r = Invoke-RestMethod -Uri "$baseUrl/$path" -Method PATCH -Body ($body | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
        return $r
    } catch {
        Write-Host "  ERROR on PATCH $path : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host " Dress for Success - Test Data Seeder" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# --- Test API is reachable ---
Write-Host "Checking API is running..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -ErrorAction Stop | Out-Null
    Write-Host "  API is online!" -ForegroundColor Green
} catch {
    Write-Host "  API is not reachable at $baseUrl. Start it first!" -ForegroundColor Red
    exit 1
}

# ============================================================
# 1. REGISTER VOLUNTEERS
# ============================================================
Write-Host "`n--- Registering Volunteers ---" -ForegroundColor Cyan

$volunteers = @(
    @{ firstName="Sarah"; lastName="Mitchell"; email="sarah.mitchell@dfs.org"; password="Volunteer1!"; phone="0412000001" },
    @{ firstName="David"; lastName="Chen"; email="david.chen@dfs.org"; password="Volunteer2!"; phone="0412000002" },
    @{ firstName="Priya"; lastName="Patel"; email="priya.patel@dfs.org"; password="Volunteer3!"; phone="0412000003" }
)

$volunteerIds = @()
foreach ($v in $volunteers) {
    $result = Post "auth/register" $v
    if ($result) {
        $volunteerIds += $result.id
        Write-Host "  Registered: $($v.firstName) $($v.lastName) (ID: $($result.id))" -ForegroundColor Green
    }
}

if ($volunteerIds.Count -eq 0) {
    Write-Host "  No volunteers registered. They may already exist. Fetching existing..." -ForegroundColor Yellow
    $existing = Invoke-RestMethod -Uri "$baseUrl/volunteers" -Method GET
    $volunteerIds = $existing | ForEach-Object { $_.id }
    Write-Host "  Found $($volunteerIds.Count) existing volunteers." -ForegroundColor Yellow
}

# ============================================================
# 2. CREATE CLIENTS
# ============================================================
Write-Host "`n--- Creating Clients ---" -ForegroundColor Cyan

$clients = @(
    @{ firstName="Emma"; lastName="Thompson"; email="emma.t@email.com"; phone="0420000001"; address="15 George St, Sydney NSW 2000"; referralAgency=1; notes="Referred by case worker Maria" },
    @{ firstName="Fatima"; lastName="Al-Rahman"; email="fatima.ar@email.com"; phone="0420000002"; address="22 Bourke St, Melbourne VIC 3000"; referralAgency=5; notes="Needs professional attire for upcoming interview" },
    @{ firstName="Jessica"; lastName="Nguyen"; email="jessica.n@email.com"; phone="0420000003"; address="8 Queen St, Brisbane QLD 4000"; referralAgency=3; notes="Employment agency referral - starting new admin role" },
    @{ firstName="Olivia"; lastName="Brown"; email="olivia.b@email.com"; phone="0420000004"; address="44 King William St, Adelaide SA 5000"; referralAgency=0; notes="Self-referred, interview next week" },
    @{ firstName="Grace"; lastName="Williams"; email="grace.w@email.com"; phone="0420000005"; address="10 Murray St, Perth WA 6000"; referralAgency=7; notes="Food bank referral, returning to work after 2 years" }
)

$clientIds = @()
foreach ($c in $clients) {
    $result = Post "clients" $c
    if ($result) {
        $clientIds += $result.id
        Write-Host "  Created: $($c.firstName) $($c.lastName) (ID: $($result.id), Referral: $($c.referralAgency))" -ForegroundColor Green
    }
}

# ============================================================
# 3. CREATE BOOKINGS (various states)
# ============================================================
Write-Host "`n--- Creating Bookings ---" -ForegroundColor Cyan

# Booking 1: Scheduled (no volunteer yet)
$b1 = Post "bookings" @{
    clientId=$clientIds[0]; volunteerId=$null
    appointmentDate="2026-05-20T09:00:00Z"
    serviceType="Clothing Consultation"
    notes="First visit, needs full outfit for interview"
}
if ($b1) { Write-Host "  Booking #$($b1.id): SCHEDULED - Emma Thompson, Clothing Consultation (no volunteer)" -ForegroundColor Green }

# Booking 2: Confirmed (volunteer assigned)
$b2 = Post "bookings" @{
    clientId=$clientIds[1]; volunteerId=$null
    appointmentDate="2026-05-18T10:30:00Z"
    serviceType="Suiting Programme"
    notes="90 minute session requested"
}
if ($b2) {
    Write-Host "  Booking #$($b2.id): SCHEDULED - Fatima Al-Rahman, Suiting Programme" -ForegroundColor Green
    $assigned = Patch "bookings/$($b2.id)/assign-volunteer" @{ volunteerId=$volunteerIds[0] }
    if ($assigned) { Write-Host "  Booking #$($b2.id): CONFIRMED - Assigned to Sarah Mitchell" -ForegroundColor Yellow }
}

# Booking 3: Completed
$b3 = Post "bookings" @{
    clientId=$clientIds[2]; volunteerId=$volunteerIds[1]
    appointmentDate="2026-05-10T14:00:00Z"
    serviceType="Clothing Consultation"
    notes="Needs business casual for admin role"
}
if ($b3) {
    Write-Host "  Booking #$($b3.id): SCHEDULED - Jessica Nguyen, Clothing Consultation" -ForegroundColor Green
    $completed = Patch "bookings/$($b3.id)/complete" @{ outcomeNotes="Client selected navy blazer, white shirt, and black trousers. Very happy with the outfit. Provided interview tips booklet." }
    if ($completed) { Write-Host "  Booking #$($b3.id): COMPLETED - Session notes recorded" -ForegroundColor DarkGreen }
}

# Booking 4: Cancelled
$b4 = Post "bookings" @{
    clientId=$clientIds[3]; volunteerId=$volunteerIds[2]
    appointmentDate="2026-05-12T11:00:00Z"
    serviceType="Career Preparation Session"
    notes="CV review and interview practice"
}
if ($b4) {
    Write-Host "  Booking #$($b4.id): SCHEDULED - Olivia Brown, Career Preparation" -ForegroundColor Green
    $cancelled = Patch "bookings/$($b4.id)/cancel" @{ cancellationReason="Client called to reschedule - interview date moved to next month." }
    if ($cancelled) { Write-Host "  Booking #$($b4.id): CANCELLED - Rescheduling" -ForegroundColor Red }
}

# Booking 5: Confirmed, future date (assigned to volunteer 2)
$b5 = Post "bookings" @{
    clientId=$clientIds[4]; volunteerId=$null
    appointmentDate="2026-05-22T13:00:00Z"
    serviceType="Suiting Programme"
    notes="Returning to work, needs professional wardrobe refresh"
}
if ($b5) {
    Write-Host "  Booking #$($b5.id): SCHEDULED - Grace Williams, Suiting Programme" -ForegroundColor Green
    $assigned2 = Patch "bookings/$($b5.id)/assign-volunteer" @{ volunteerId=$volunteerIds[1] }
    if ($assigned2) { Write-Host "  Booking #$($b5.id): CONFIRMED - Assigned to David Chen" -ForegroundColor Yellow }
}

# Booking 6: Another completed one for volunteer 1
$b6 = Post "bookings" @{
    clientId=$clientIds[0]; volunteerId=$volunteerIds[0]
    appointmentDate="2026-05-08T09:30:00Z"
    serviceType="Follow-Up Appointment"
    notes="Follow-up after initial consultation"
}
if ($b6) {
    Write-Host "  Booking #$($b6.id): SCHEDULED - Emma Thompson, Follow-Up" -ForegroundColor Green
    $completed2 = Patch "bookings/$($b6.id)/complete" @{ outcomeNotes="Follow-up visit. Client tried on additional items. Selected a second outfit for backup. Very confident going into interview." }
    if ($completed2) { Write-Host "  Booking #$($b6.id): COMPLETED - Follow-up notes recorded" -ForegroundColor DarkGreen }
}

# Booking 7: Scheduled and assigned to volunteer 3
$b7 = Post "bookings" @{
    clientId=$clientIds[1]; volunteerId=$null
    appointmentDate="2026-05-25T15:00:00Z"
    serviceType="Clothing Consultation"
    notes="Second visit for different interview outfit"
}
if ($b7) {
    Write-Host "  Booking #$($b7.id): SCHEDULED - Fatima Al-Rahman, 2nd Consultation" -ForegroundColor Green
    $assigned3 = Patch "bookings/$($b7.id)/assign-volunteer" @{ volunteerId=$volunteerIds[2] }
    if ($assigned3) { Write-Host "  Booking #$($b7.id): CONFIRMED - Assigned to Priya Patel" -ForegroundColor Yellow }
}

# ============================================================
# SUMMARY
# ============================================================
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host " Seed Complete! Summary:" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  Volunteers: 3 registered" -ForegroundColor White
Write-Host "  Clients:    5 created" -ForegroundColor White
Write-Host "  Bookings:   7 created" -ForegroundColor White
Write-Host ""
Write-Host "  Booking States:" -ForegroundColor White
Write-Host "    - Scheduled  (unassigned):  1 booking" -ForegroundColor Gray
Write-Host "    - Confirmed  (assigned):    3 bookings" -ForegroundColor Yellow
Write-Host "    - Completed  (with notes):  2 bookings" -ForegroundColor Green
Write-Host "    - Cancelled  (with reason): 1 booking" -ForegroundColor Red
Write-Host ""
Write-Host "  Volunteer Logins:" -ForegroundColor White
Write-Host "    sarah.mitchell@dfs.org / Volunteer1!" -ForegroundColor Gray
Write-Host "    david.chen@dfs.org     / Volunteer2!" -ForegroundColor Gray
Write-Host "    priya.patel@dfs.org    / Volunteer3!" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Magenta

