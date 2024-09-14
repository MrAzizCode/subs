local playerPed = GetPlayerPed(-1)

-- Check if the player is near a vehicle 
local vehicle = nil
local plateNumber = nil

-- Get the vehicle the player is near
if IsPedInAnyVehicle(playerPed, false) then
    vehicle = GetVehiclePedIsIn(playerPed, false)
    plateNumber = GetVehicleNumberPlateText(vehicle)
else
    local coords = GetEntityCoords(playerPed)
    vehicle = GetClosestVehicle(coords.x, coords.y, coords.z, 5.0, 0, 7)
    plateNumber = GetVehicleNumberPlateText(vehicle)
end

-- Check if a vehicle was found
if vehicle and plateNumber then
   TriggerServerEvent('qb-vehiclekeys:server:AcquireVehicleKeys', plateNumber)
else
    -- Handle the case when no vehicle is found
    print("No vehicle found.")
end
