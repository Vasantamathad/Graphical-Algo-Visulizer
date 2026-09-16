#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <graphics.h>
#include <conio.h>

// Screen dimensions
#define SCREEN_WIDTH 1000
#define SCREEN_HEIGHT 700

// Origin for the mathematical coordinate system
#define ORIGIN_X 400
#define ORIGIN_Y 350

// Cohen-Sutherland Region Codes
#define INSIDE 0 // 0000
#define LEFT   1 // 0001
#define RIGHT  2 // 0010
#define BOTTOM 4 // 0100
#define TOP    8 // 1000

// Animation Delays
int anim_delay = 50; // Medium by default

typedef struct {
    int x;
    int y;
} Point;

typedef struct {
    int xmin;
    int ymin;
    int xmax;
    int ymax;
} ClipWindow;

// --- Function Prototypes ---
void initGraphicsWindow();
void drawCoordinateSystem();
void drawMenuUI();
void drawInfoPanel(const char* title);
void clearInfoPanel();
void updateInfoPanelText(int line, const char* text);
void drawPixelGrid(int x, int y, int color);
int getGraphicalInput(const char* prompt, int line_num);

// Coordinates mapping
int toScreenX(int x);
int toScreenY(int y);

// Algorithms
void ddaLine(int x1, int y1, int x2, int y2);
void bresenhamLine(int x1, int y1, int x2, int y2);
void midpointLine(int x1, int y1, int x2, int y2);
int computeOutCode(double x, double y, ClipWindow win);
void cohenSutherlandClip(double x1, double y1, double x2, double y2, ClipWindow win);

// Screens
void compareAlgorithms();
void algorithmInfo(int algo);
void aboutProject();
void setAnimationSpeed();

// --- Main Function ---
int main() {
    int choice = 0;
    int x1, y1, x2, y2;
    ClipWindow win;
    char inputBuffer[100];

    initGraphicsWindow();

    while (1) {
        cleardevice();
        drawMenuUI();
        
        // Wait for keyboard input
        choice = getch();

        if (choice == '1') {
            cleardevice();
            drawCoordinateSystem();
            drawInfoPanel("DDA LINE DRAWING");
            
            updateInfoPanelText(1, "Enter Coordinates:");
            x1 = getGraphicalInput("X1:", 3);
            y1 = getGraphicalInput("Y1:", 4);
            x2 = getGraphicalInput("X2:", 5);
            y2 = getGraphicalInput("Y2:", 6);
            
            clearInfoPanel();
            
            ddaLine(x1, y1, x2, y2);
            updateInfoPanelText(9, "Algorithm Completed!");
            getch();
        } 
        else if (choice == '2') {
            cleardevice();
            drawCoordinateSystem();
            drawInfoPanel("BRESENHAM LINE");
            
            updateInfoPanelText(1, "Enter Coordinates:");
            x1 = getGraphicalInput("X1:", 3);
            y1 = getGraphicalInput("Y1:", 4);
            x2 = getGraphicalInput("X2:", 5);
            y2 = getGraphicalInput("Y2:", 6);
            
            clearInfoPanel();
            
            bresenhamLine(x1, y1, x2, y2);
            updateInfoPanelText(9, "Algorithm Completed!");
            getch();
        }
        else if (choice == '3') {
            cleardevice();
            drawCoordinateSystem();
            drawInfoPanel("MIDPOINT LINE");
            
            updateInfoPanelText(1, "Enter Coordinates:");
            x1 = getGraphicalInput("X1:", 3);
            y1 = getGraphicalInput("Y1:", 4);
            x2 = getGraphicalInput("X2:", 5);
            y2 = getGraphicalInput("Y2:", 6);
            
            clearInfoPanel();
            
            midpointLine(x1, y1, x2, y2);
            updateInfoPanelText(9, "Algorithm Completed!");
            getch();
        }
        else if (choice == '4') {
            cleardevice();
            drawCoordinateSystem();
            drawInfoPanel("COHEN-SUTHERLAND");
            
            updateInfoPanelText(1, "Enter Line Coords:");
            x1 = getGraphicalInput("Line X1:", 2);
            y1 = getGraphicalInput("Line Y1:", 3);
            x2 = getGraphicalInput("Line X2:", 4);
            y2 = getGraphicalInput("Line Y2:", 5);

            updateInfoPanelText(7, "Enter Window:");
            win.xmin = getGraphicalInput("X Min:", 8);
            win.ymin = getGraphicalInput("Y Min:", 9);
            win.xmax = getGraphicalInput("X Max:", 10);
            win.ymax = getGraphicalInput("Y Max:", 11);
            
            clearInfoPanel();
            
            // Draw window
            setcolor(YELLOW);
            rectangle(toScreenX(win.xmin), toScreenY(win.ymax), toScreenX(win.xmax), toScreenY(win.ymin));
            
            cohenSutherlandClip(x1, y1, x2, y2, win);
            updateInfoPanelText(13, "Algorithm Completed!");
            getch();
        }
        else if (choice == '5') {
            compareAlgorithms();
        }
        else if (choice == '6') {
            // Algorithm Info submenu
            cleardevice();
            setcolor(WHITE);
            settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 3);
            outtextxy(300, 50, "Select Algorithm Info");
            settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 2);
            outtextxy(350, 150, "1. DDA");
            outtextxy(350, 200, "2. Bresenham");
            outtextxy(350, 250, "3. Midpoint");
            outtextxy(350, 300, "4. Cohen-Sutherland");
            
            int infoChoice = getch();
            algorithmInfo(infoChoice - '0');
        }
        else if (choice == '7') {
            aboutProject();
        }
        else if (choice == '8') {
            setAnimationSpeed();
        }
        else if (choice == '9') {
            break;
        }
    }

    closegraph();
    return 0;
}

// --- Coordinate Systems ---
int toScreenX(int x) {
    return ORIGIN_X + x;
}

int toScreenY(int y) {
    // Y increases downwards on screen, but upwards in math
    return ORIGIN_Y - y;
}

void initGraphicsWindow() {
    int gd = DETECT, gm;
    // WinBGIm supports large resolutions directly
    initwindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Graphics Algorithm Visualizer");
}

void drawCoordinateSystem() {
    setcolor(DARKGRAY);
    // X Axis
    line(0, ORIGIN_Y, ORIGIN_X * 2, ORIGIN_Y);
    // Y Axis
    line(ORIGIN_X, 0, ORIGIN_X, SCREEN_HEIGHT);
    
    settextstyle(DEFAULT_FONT, HORIZ_DIR, 1);
    outtextxy(ORIGIN_X * 2 - 20, ORIGIN_Y + 10, "X");
    outtextxy(ORIGIN_X + 10, 20, "Y");
    outtextxy(ORIGIN_X - 20, ORIGIN_Y + 10, "0,0");
}

void drawMenuUI() {
    setcolor(LIGHTBLUE);
    rectangle(10, 10, SCREEN_WIDTH - 10, SCREEN_HEIGHT - 10);
    rectangle(15, 15, SCREEN_WIDTH - 15, SCREEN_HEIGHT - 15);

    setcolor(YELLOW);
    settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 4);
    outtextxy(150, 50, "GRAPHICS ALGORITHM VISUALIZER");
    
    setcolor(WHITE);
    settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 2);
    outtextxy(350, 200, "1. DDA Line Drawing");
    outtextxy(350, 250, "2. Bresenham Line Drawing");
    outtextxy(350, 300, "3. Midpoint Line Drawing");
    outtextxy(350, 350, "4. Cohen-Sutherland Line Clipping");
    outtextxy(350, 400, "5. Compare Algorithms");
    outtextxy(350, 450, "6. Algorithm Information");
    outtextxy(350, 500, "7. About Project");
    outtextxy(350, 550, "8. Set Animation Speed");
    outtextxy(350, 600, "9. Exit");

    setcolor(LIGHTGREEN);
    outtextxy(300, 650, "Press Number Key to Select...");
}

void drawInfoPanel(const char* title) {
    setcolor(WHITE);
    // Panel background border
    rectangle(ORIGIN_X * 2 + 10, 10, SCREEN_WIDTH - 10, SCREEN_HEIGHT - 10);
    
    setcolor(YELLOW);
    settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 2);
    outtextxy(ORIGIN_X * 2 + 20, 20, title);
    line(ORIGIN_X * 2 + 10, 50, SCREEN_WIDTH - 10, 50);
}

void clearInfoPanel() {
    setfillstyle(SOLID_FILL, BLACK);
    bar(ORIGIN_X * 2 + 11, 51, SCREEN_WIDTH - 11, SCREEN_HEIGHT - 11);
}

void updateInfoPanelText(int line_num, const char* text) {
    setcolor(WHITE);
    settextstyle(DEFAULT_FONT, HORIZ_DIR, 1);
    outtextxy(ORIGIN_X * 2 + 20, 60 + (line_num * 20), text);
}

int getGraphicalInput(const char* prompt, int line_num) {
    char str[20] = "";
    int i = 0;
    int ch;
    char displayStr[100];
    int x = ORIGIN_X * 2 + 20;
    int y = 60 + (line_num * 20);
    
    // Clear keyboard buffer just in case
    while (kbhit()) getch();
    
    while(1) {
        sprintf(displayStr, "%s %s_", prompt, str);
        
        // clear just this line in the info panel
        setfillstyle(SOLID_FILL, BLACK);
        bar(x, y, SCREEN_WIDTH - 11, y + 18);
        
        setcolor(YELLOW);
        settextstyle(DEFAULT_FONT, HORIZ_DIR, 1);
        outtextxy(x, y, displayStr);
        
        ch = getch();
        if (ch == 13) { // Enter key
            if (i > 0 || (i == 1 && str[0] == '-')) break;
        } else if (ch == 8) { // Backspace
            if (i > 0) {
                i--;
                str[i] = '\0';
            }
        } else if ((ch >= '0' && ch <= '9') || (ch == '-' && i == 0)) {
            if (i < 10) {
                str[i++] = ch;
                str[i] = '\0';
            }
        }
    }
    
    // clear cursor and show final
    sprintf(displayStr, "%s %s", prompt, str);
    setfillstyle(SOLID_FILL, BLACK);
    bar(x, y, SCREEN_WIDTH - 11, y + 18);
    setcolor(WHITE);
    outtextxy(x, y, displayStr);
    
    return atoi(str);
}

// Visual pixel grid - drawing a small rectangle to represent a mathematical point
void drawPixelGrid(int mathX, int mathY, int color) {
    int sx = toScreenX(mathX);
    int sy = toScreenY(mathY);
    setcolor(color);
    rectangle(sx - 2, sy - 2, sx + 2, sy + 2);
    // Also plot the center
    putpixel(sx, sy, color);
}

// --- Algorithm Implementations ---

void ddaLine(int x1, int y1, int x2, int y2) {
    char buf[100];
    int dx = x2 - x1;
    int dy = y2 - y1;
    
    int steps = abs(dx) > abs(dy) ? abs(dx) : abs(dy);
    
    float xInc = dx / (float)steps;
    float yInc = dy / (float)steps;
    
    float x = x1;
    float y = y1;
    
    sprintf(buf, "Start: (%d, %d)", x1, y1); updateInfoPanelText(1, buf);
    sprintf(buf, "End:   (%d, %d)", x2, y2); updateInfoPanelText(2, buf);
    sprintf(buf, "dx: %d, dy: %d", dx, dy); updateInfoPanelText(3, buf);
    sprintf(buf, "Steps: %d", steps); updateInfoPanelText(4, buf);
    
    for (int i = 0; i <= steps; i++) {
        drawPixelGrid(round(x), round(y), RED);
        
        clearInfoPanel();
        updateInfoPanelText(1, "--- DDA STEP ---");
        sprintf(buf, "Step: %d / %d", i, steps); updateInfoPanelText(3, buf);
        sprintf(buf, "X (float): %.2f", x); updateInfoPanelText(4, buf);
        sprintf(buf, "Y (float): %.2f", y); updateInfoPanelText(5, buf);
        sprintf(buf, "Plot: (%d, %d)", (int)round(x), (int)round(y)); updateInfoPanelText(7, buf);
        
        x += xInc;
        y += yInc;
        delay(anim_delay);
    }
}

void bresenhamLine(int x1, int y1, int x2, int y2) {
    char buf[100];
    int dx = abs(x2 - x1);
    int dy = abs(y2 - y1);
    
    int sx = (x1 < x2) ? 1 : -1;
    int sy = (y1 < y2) ? 1 : -1;
    
    int err = dx - dy;
    
    sprintf(buf, "Start: (%d, %d)", x1, y1); updateInfoPanelText(1, buf);
    sprintf(buf, "End:   (%d, %d)", x2, y2); updateInfoPanelText(2, buf);
    
    int step = 0;
    while (1) {
        drawPixelGrid(x1, y1, LIGHTGREEN);
        
        clearInfoPanel();
        updateInfoPanelText(1, "--- BRESENHAM STEP ---");
        sprintf(buf, "Step: %d", step++); updateInfoPanelText(2, buf);
        sprintf(buf, "Plot: (%d, %d)", x1, y1); updateInfoPanelText(4, buf);
        sprintf(buf, "Err (Param): %d", err); updateInfoPanelText(5, buf);
        
        delay(anim_delay);
        
        if (x1 == x2 && y1 == y2) break;
        
        int e2 = 2 * err;
        
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}

void midpointLine(int x1, int y1, int x2, int y2) {
    char buf[100];
    int dx = x2 - x1;
    int dy = y2 - y1;
    
    int d = 2 * dy - dx;
    int incrE = 2 * dy;
    int incrNE = 2 * (dy - dx);
    
    int x = x1;
    int y = y1;
    
    int step = 0;
    
    // Simplified for first octant to match educational scope clarity
    // (A fully generalized midpoint is extremely long and hard to follow visually)
    drawPixelGrid(x, y, MAGENTA);
    
    while (x < x2) {
        clearInfoPanel();
        updateInfoPanelText(1, "--- MIDPOINT STEP ---");
        sprintf(buf, "Step: %d", step++); updateInfoPanelText(2, buf);
        sprintf(buf, "Current: (%d, %d)", x, y); updateInfoPanelText(3, buf);
        sprintf(buf, "Decision Param (d): %d", d); updateInfoPanelText(5, buf);
        
        if (d <= 0) {
            updateInfoPanelText(6, "d <= 0, Choose East");
            d += incrE;
            x++;
        } else {
            updateInfoPanelText(6, "d > 0, Choose North-East");
            d += incrNE;
            x++;
            y++;
        }
        drawPixelGrid(x, y, MAGENTA);
        sprintf(buf, "Plot: (%d, %d)", x, y); updateInfoPanelText(8, buf);
        
        delay(anim_delay);
    }
}

int computeOutCode(double x, double y, ClipWindow win) {
    int code = INSIDE;
    if (x < win.xmin) code |= LEFT;
    else if (x > win.xmax) code |= RIGHT;
    
    if (y < win.ymin) code |= BOTTOM;
    else if (y > win.ymax) code |= TOP;
    
    return code;
}

void cohenSutherlandClip(double x1, double y1, double x2, double y2, ClipWindow win) {
    char buf[100];
    int outcode1 = computeOutCode(x1, y1, win);
    int outcode2 = computeOutCode(x2, y2, win);
    int accept = 0;
    int step = 1;
    
    // Draw initial unclipped line
    setcolor(DARKGRAY);
    line(toScreenX(x1), toScreenY(y1), toScreenX(x2), toScreenY(y2));
    
    while (1) {
        clearInfoPanel();
        sprintf(buf, "Step %d:", step++); updateInfoPanelText(1, buf);
        sprintf(buf, "P1 Code: %d", outcode1); updateInfoPanelText(2, buf);
        sprintf(buf, "P2 Code: %d", outcode2); updateInfoPanelText(3, buf);
        
        if (!(outcode1 | outcode2)) {
            updateInfoPanelText(5, "TRIVIALLY ACCEPTED");
            accept = 1;
            delay(1500);
            break;
        } else if (outcode1 & outcode2) {
            updateInfoPanelText(5, "TRIVIALLY REJECTED");
            delay(1500);
            break;
        } else {
            updateInfoPanelText(5, "REQUIRES CLIPPING");
            delay(1000);
            
            double x, y;
            int outcodeOut = outcode1 ? outcode1 : outcode2;
            
            if (outcodeOut & TOP) {
                x = x1 + (x2 - x1) * (win.ymax - y1) / (y2 - y1);
                y = win.ymax;
            } else if (outcodeOut & BOTTOM) {
                x = x1 + (x2 - x1) * (win.ymin - y1) / (y2 - y1);
                y = win.ymin;
            } else if (outcodeOut & RIGHT) {
                y = y1 + (y2 - y1) * (win.xmax - x1) / (x2 - x1);
                x = win.xmax;
            } else if (outcodeOut & LEFT) {
                y = y1 + (y2 - y1) * (win.xmin - x1) / (x2 - x1);
                x = win.xmin;
            }
            
            if (outcodeOut == outcode1) {
                x1 = x; y1 = y;
                outcode1 = computeOutCode(x1, y1, win);
            } else {
                x2 = x; y2 = y;
                outcode2 = computeOutCode(x2, y2, win);
            }
            
            sprintf(buf, "Intersection: (%.1f, %.1f)", x, y); updateInfoPanelText(7, buf);
            delay(1500);
        }
    }
    
    if (accept) {
        setcolor(LIGHTCYAN);
        line(toScreenX(x1), toScreenY(y1), toScreenX(x2), toScreenY(y2));
        updateInfoPanelText(9, "Drawing Final Clipped Line");
    }
}

// --- Menu Screens ---
void compareAlgorithms() {
    cleardevice();
    setcolor(YELLOW);
    settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 3);
    outtextxy(100, 50, "ALGORITHM COMPARISON");
    
    setcolor(WHITE);
    settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 2);
    outtextxy(50, 150, "Algorithm         Math           Feature");
    outtextxy(50, 170, "--------------------------------------------------");
    outtextxy(50, 200, "DDA               Float         Simple, Easy");
    outtextxy(50, 250, "Bresenham         Integer       Highly Efficient");
    outtextxy(50, 300, "Midpoint          Decision      Used for Circles too");
    outtextxy(50, 350, "Cohen-Sutherland  Bitwise/Codes Fast Clipping");
    
    setcolor(LIGHTGREEN);
    outtextxy(300, 600, "Press Any Key to Return...");
    getch();
}

void algorithmInfo(int algo) {
    cleardevice();
    setcolor(WHITE);
    settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 2);
    
    if (algo == 1) {
        setcolor(YELLOW); outtextxy(100, 50, "DDA INFORMATION"); setcolor(WHITE);
        outtextxy(50, 100, "Digital Differential Analyzer.");
        outtextxy(50, 150, "Works by finding the longest distance (dx or dy).");
        outtextxy(50, 200, "Divides the shorter distance by the longer one.");
        outtextxy(50, 250, "Uses float math, making it slightly inefficient.");
    } else if (algo == 2) {
        setcolor(YELLOW); outtextxy(100, 50, "BRESENHAM INFORMATION"); setcolor(WHITE);
        outtextxy(50, 100, "Highly optimized line algorithm.");
        outtextxy(50, 150, "Uses only integer addition and subtraction.");
        outtextxy(50, 200, "Tracks a decision parameter to decide pixel placement.");
        outtextxy(50, 250, "Extremely fast for CPU rasterization.");
    } else if (algo == 3) {
        setcolor(YELLOW); outtextxy(100, 50, "MIDPOINT INFORMATION"); setcolor(WHITE);
        outtextxy(50, 100, "Conceptually elegant line and circle algorithm.");
        outtextxy(50, 150, "Evaluates the geometric midpoint between candidates.");
        outtextxy(50, 200, "If midpoint is below true line, choose top pixel.");
    } else if (algo == 4) {
        setcolor(YELLOW); outtextxy(100, 50, "COHEN-SUTHERLAND INFORMATION"); setcolor(WHITE);
        outtextxy(50, 100, "Divides space into 9 regions using a clipping window.");
        outtextxy(50, 150, "Assigns 4-bit region codes (Top, Bottom, Right, Left).");
        outtextxy(50, 200, "Uses Bitwise AND / OR for trivial accept/reject.");
    } else {
        outtextxy(50, 100, "Invalid Choice.");
    }
    
    setcolor(LIGHTGREEN);
    outtextxy(300, 600, "Press Any Key to Return...");
    getch();
}

void aboutProject() {
    cleardevice();
    setcolor(YELLOW);
    settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 3);
    outtextxy(100, 50, "ABOUT PROJECT");
    
    setcolor(WHITE);
    settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 2);
    outtextxy(100, 150, "GRAPHICS ALGORITHM VISUALIZER");
    outtextxy(100, 200, "A Computer Graphics Educational Project");
    
    outtextxy(100, 300, "Student Name : [Placeholder]");
    outtextxy(100, 350, "USN          : [Placeholder]");
    outtextxy(100, 400, "College      : [Placeholder]");
    outtextxy(100, 450, "Department   : [Placeholder]");
    outtextxy(100, 500, "Guide        : [Placeholder]");
    outtextxy(100, 550, "Academic Year: [Placeholder]");
    
    setcolor(LIGHTGREEN);
    outtextxy(300, 600, "Press Any Key to Return...");
    getch();
}

void setAnimationSpeed() {
    cleardevice();
    setcolor(YELLOW);
    settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 3);
    outtextxy(100, 50, "SET ANIMATION SPEED");
    
    setcolor(WHITE);
    settextstyle(SANS_SERIF_FONT, HORIZ_DIR, 2);
    outtextxy(100, 150, "1. Slow (200ms)");
    outtextxy(100, 200, "2. Medium (50ms) - DEFAULT");
    outtextxy(100, 250, "3. Fast (10ms)");
    
    int choice = getch();
    if (choice == '1') anim_delay = 200;
    else if (choice == '2') anim_delay = 50;
    else if (choice == '3') anim_delay = 10;
    
    outtextxy(100, 400, "Speed Updated Successfully!");
    delay(1000);
}
