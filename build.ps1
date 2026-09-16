$ErrorActionPreference = "Stop"

Write-Host "=== 1. Compiling 64-bit libbgi.a library ==="
Set-Location "C:\Users\VASANTA M\OneDrive\Desktop\GAV\WinBGIm-64-main\libbgi\src"
g++ -c -w -fpermissive -I../include bgi.cxx bgiout.cxx dibutil.cxx drawing.cxx file.cxx misc.cxx mouse.cxx palette.cxx text.cxx winbgi.cxx winthread.cxx

Write-Host "=== 2. Archiving object files ==="
$objFiles = Get-ChildItem -Filter *.o -Name
$arCommand = "ar"
$arArgs = @("rcs", "libbgi.a") + $objFiles
& $arCommand $arArgs

Write-Host "=== 3. Copying library and headers to project root ==="
Copy-Item "libbgi.a" -Destination "C:\Users\VASANTA M\OneDrive\Desktop\GAV\libbgi.a" -Force
Copy-Item "..\include\bgi\graphics.h" -Destination "C:\Users\VASANTA M\OneDrive\Desktop\GAV\graphics.h" -Force
Copy-Item "..\include\bgi\winbgim.h" -Destination "C:\Users\VASANTA M\OneDrive\Desktop\GAV\winbgim.h" -Force

Write-Host "=== 4. Compiling main.c ==="
Set-Location "C:\Users\VASANTA M\OneDrive\Desktop\GAV"
g++ main.c -o visualizer.exe -I. -L. -lbgi -lgdi32 -lcomdlg32 -luuid -loleaut32 -lole32 -fpermissive

Write-Host "=== 5. SUCCESS! Launching Visualizer ==="
.\visualizer.exe
