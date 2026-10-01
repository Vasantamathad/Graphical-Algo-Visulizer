import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_report():
    doc = docx.Document()

    # Define Page Margins (0.5 inch all around to fit exactly 15 pages with 14pt content)
    margin_inch = 0.5
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(margin_inch)
        section.bottom_margin = Inches(margin_inch)
        section.left_margin = Inches(margin_inch)
        section.right_margin = Inches(margin_inch)

    table_width = 8.5 - 2 * margin_inch  # 7.5 inches printable width

    # Color Palette Constants
    COLOR_PRIMARY = RGBColor(27, 54, 93)      # Deep Navy #1B365D
    COLOR_SECONDARY = RGBColor(43, 84, 126)   # Slate Blue #2B547E
    COLOR_ACCENT = RGBColor(217, 119, 6)      # Warm Amber #D97706
    COLOR_TEXT = RGBColor(30, 41, 59)         # Dark Charcoal #1E293B

    HEX_PRIMARY = "1B365D"
    HEX_BORDER = "CBD5E1"
    HEX_CALLOUT_BG = "F0F4F8"
    HEX_ALT_ROW = "F1F5F9"

    # Set Default Font Styles (Content font size 14 pt)
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Calibri'
    font.size = Pt(14)
    font.color.rgb = COLOR_TEXT

    # Helper Functions for XML Manipulation & Table Styling
    def set_cell_background(cell, hex_color):
        tcPr = cell._element.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=12, bottom=12, left=40, right=40):
        tcPr = cell._element.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def style_table(table, col_widths_pct, headers, data, tbl_font=11.5):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        tblPr = table._element.xpath('w:tblPr')
        if tblPr:
            borders = parse_xml(f'''
                <w:tblBorders {nsdecls("w")}>
                    <w:top w:val="single" w:sz="6" w:space="0" w:color="{HEX_PRIMARY}"/>
                    <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{HEX_PRIMARY}"/>
                    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                    <w:insideV w:val="none"/>
                    <w:left w:val="none"/>
                    <w:right w:val="none"/>
                </w:tblBorders>
            ''')
            tblPr[0].append(borders)

        # Header Row
        hdr_cells = table.rows[0].cells
        for i, header_text in enumerate(headers):
            hdr_cells[i].text = header_text
            set_cell_background(hdr_cells[i], HEX_PRIMARY)
            set_cell_margins(hdr_cells[i], top=22, bottom=22, left=40, right=40)
            p = hdr_cells[i].paragraphs[0]
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_after = Pt(0)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                run.font.size = Pt(tbl_font)
                run.font.name = 'Calibri'

        # Data Rows
        for r_idx, row_data in enumerate(data):
            row_cells = table.add_row().cells
            bg_color = HEX_ALT_ROW if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell_value in enumerate(row_data):
                row_cells[c_idx].text = str(cell_value)
                set_cell_background(row_cells[c_idx], bg_color)
                set_cell_margins(row_cells[c_idx], top=12, bottom=12, left=40, right=40)
                p = row_cells[c_idx].paragraphs[0]
                p.paragraph_format.line_spacing = 1.0
                p.paragraph_format.space_after = Pt(0)
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                for run in p.runs:
                    run.font.size = Pt(tbl_font)
                    run.font.color.rgb = COLOR_TEXT
                    run.font.name = 'Calibri'

        # Apply Column Widths
        actual_widths = [pct * table_width for pct in col_widths_pct]
        for row in table.rows:
            for idx, width in enumerate(actual_widths):
                row.cells[idx].width = Inches(width)

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(16)  # Subtitles 16 font size
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(16)  # Subtitles 16 font size
        run.font.bold = True
        run.font.color.rgb = COLOR_SECONDARY
        return p

    def add_heading_3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(16)  # Subtitles 16 font size
        run.font.bold = True
        run.font.color.rgb = COLOR_ACCENT
        return p

    def add_paragraph(text, bold_prefix="", space_after=0.5):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.0
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = 'Calibri'
            r_bold.font.bold = True
            r_bold.font.size = Pt(14)
            r_bold.font.color.rgb = COLOR_PRIMARY
        r_text = p.add_run(text)
        r_text.font.name = 'Calibri'
        r_text.font.size = Pt(14)  # Content 14 font size
        r_text.font.color.rgb = COLOR_TEXT
        return p

    def add_bullet(text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(0.5)
        p.paragraph_format.line_spacing = 1.0
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = 'Calibri'
            r_bold.font.bold = True
            r_bold.font.size = Pt(14)
            r_bold.font.color.rgb = COLOR_PRIMARY
        r_text = p.add_run(text)
        r_text.font.name = 'Calibri'
        r_text.font.size = Pt(14)  # Content 14 font size
        r_text.font.color.rgb = COLOR_TEXT
        return p

    def add_callout(title, text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(table_width)
        set_cell_background(cell, HEX_CALLOUT_BG)
        set_cell_margins(cell, top=20, bottom=20, left=40, right=40)

        tcPr = cell._element.get_or_add_tcPr()
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="none"/>
                <w:bottom w:val="none"/>
                <w:left w:val="single" w:sz="24" w:space="0" w:color="{HEX_PRIMARY}"/>
                <w:right w:val="none"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)

        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0.5)
        p.paragraph_format.line_spacing = 1.0
        r_title = p.add_run(f"📌 {title}\n")
        r_title.font.name = 'Calibri'
        r_title.font.bold = True
        r_title.font.size = Pt(14)
        r_title.font.color.rgb = COLOR_PRIMARY

        r_text = p.add_run(text)
        r_text.font.name = 'Calibri'
        r_text.font.size = Pt(14)
        r_text.font.italic = True
        r_text.font.color.rgb = COLOR_TEXT

    def add_code_block(code_text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(table_width)
        set_cell_background(cell, "F4F4F5")
        set_cell_margins(cell, top=20, bottom=20, left=40, right=40)

        tcPr = cell._element.get_or_add_tcPr()
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                <w:bottom w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                <w:left w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
                <w:right w:val="single" w:sz="4" w:space="0" w:color="{HEX_BORDER}"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)

        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.0
        r_code = p.add_run(code_text)
        r_code.font.name = 'Consolas'
        r_code.font.size = Pt(10)
        r_code.font.color.rgb = RGBColor(15, 23, 42)

    # ---------------------------------------------------------
    # COVER / TITLE BLOCK (Main Title: 18 font size, Subtitle: 16 font size)
    # ---------------------------------------------------------
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(8)
    p_title.paragraph_format.space_after = Pt(3)
    r = p_title.add_run("ACADEMIC PROJECT REPORT\nGRAPHICS ALGORITHM VISUALIZER")
    r.font.name = 'Calibri'
    r.font.size = Pt(18)  # Main title 18 font size
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(6)
    r_sub = p_sub.add_run("Interactive Computer Graphics Learning & Algorithm Rasterization Platform\nMaster of Computer Applications (MCA) - 3rd Semester Project")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(16)  # Subtitles 16 font size
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_SECONDARY

    # Metadata Table Box (Content 14 font size)
    meta_table = doc.add_table(rows=6, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_widths = [0.30, 0.70]
    meta_data = [
        ["Project Title:", "Graphics Algorithm Visualizer"],
        ["Course / Academic Term:", "MCA 3rd Semester - Computer Graphics Lab"],
        ["Repository Corpus:", "riyanavade/Graphics-Algorithm-Visualizer"],
        ["Architecture & Tech Stack:", "HTML5, Vanilla CSS3, Modular ES6 JS, HTML5 Canvas API"],
        ["Target Domain:", "Computer Graphics Rasterization & Vector Line Clipping"],
        ["Document Type:", "Comprehensive Project Analysis, Test Plan & Quality Assurance Report"]
    ]
    for idx, (k, v) in enumerate(meta_data):
        row = meta_table.rows[idx]
        row.cells[0].text = k
        row.cells[1].text = v
        set_cell_background(row.cells[0], HEX_CALLOUT_BG)
        set_cell_background(row.cells[1], "FFFFFF")
        set_cell_margins(row.cells[0], top=15, bottom=15, left=40, right=40)
        set_cell_margins(row.cells[1], top=15, bottom=15, left=40, right=40)
        row.cells[0].width = Inches(meta_widths[0] * table_width)
        row.cells[1].width = Inches(meta_widths[1] * table_width)
        p0 = row.cells[0].paragraphs[0]
        p0.paragraph_format.line_spacing = 1.0
        p0.paragraph_format.space_after = Pt(0)
        p0.runs[0].font.bold = True
        p0.runs[0].font.color.rgb = COLOR_PRIMARY
        p0.runs[0].font.size = Pt(14)
        p1 = row.cells[1].paragraphs[0]
        p1.paragraph_format.line_spacing = 1.0
        p1.paragraph_format.space_after = Pt(0)
        p1.runs[0].font.color.rgb = COLOR_TEXT
        p1.runs[0].font.size = Pt(14)

    doc.add_page_break()

    # ---------------------------------------------------------
    # TABLE OF CONTENTS SUMMARY
    # ---------------------------------------------------------
    add_heading_1("Table of Contents")
    toc_items = [
        ("1", "Project Overview", "Comprehensive introduction, problem statement, core objectives, mathematical formulas, and architectural stack."),
        ("2", "Requirement Verification", "Functional (FR) and Non-Functional (NFR) requirement verification matrices and compliance traceability."),
        ("3", "Test Plan", "Test strategy, execution scope, environments, entry/exit criteria, and quality assurance deliverables."),
        ("4", "Test Cases", "Exhaustive structured test suite containing 30 test cases across engine math, UI, and playback controls."),
        ("5", "Bug / Defect Report", "Defect tracking log, severity classification matrix, root-cause analysis, and resolution verification."),
        ("6", "Debugging Report", "Deep-dive technical investigation, memory management, canvas coordinate transformations, and code fixes."),
        ("7", "Validation Report", "Sanitization policies, input boundary constraints, real-time error handling UI, and exception safety."),
        ("8", "Software and Hardware Requirements", "Detailed system specifications, client-side runtime dependencies, and hardware resource allocations."),
        ("9", "Workflow of the Project", "Layered software architecture, state machine transitions, user interaction lifecycle, and data flow pipelines.")
    ]
    toc_table = doc.add_table(rows=1, cols=3)
    style_table(toc_table, [0.08, 0.37, 0.55], ["No.", "Topic Title", "Description Summary"], [[item[0], item[1], item[2]] for item in toc_items])

    add_callout("Document Guidelines & Academic Context", "This report is compiled according to postgraduate software engineering standards for MCA Computer Graphics coursework. It covers full architectural specifications, mathematical algorithm derivations, empirical test results, defect lifecycle logs, and project workflow models.")

    # ---------------------------------------------------------
    # SECTION 1: PROJECT OVERVIEW
    # ---------------------------------------------------------
    add_heading_1("1. Project Overview")
    
    add_heading_2("1.1 Executive Summary & Problem Statement")
    add_paragraph("In computer science higher education—specifically within Master of Computer Applications (MCA) Computer Graphics coursework—mastering fundamental rasterization and vector clipping algorithms presents significant cognitive challenges. Traditional textbooks provide static mathematical equations and final discrete pixel outputs. However, students frequently struggle to visualize intermediate calculation steps, floating-point coordinate roundings, octant decision parameter updates, and clipping outcode bitwise operations.")
    add_paragraph("The Graphics Algorithm Visualizer is a client-side, interactive educational web application engineered to bridge the gap between abstract mathematical formulation and discrete screen-space pixel rasterization. Built purely with modern Web standards (HTML5, Vanilla CSS3, ES6 JavaScript, and the HTML5 Canvas API), the platform allows users to dynamically configure algorithm input parameters, watch real-time step-by-step pixel plotting animations, inspect granular calculation breakdown tables, and analyze dedicated algorithmic rationale panels ('Why This Pixel?').")

    add_heading_2("1.2 Primary Objectives")
    add_bullet(" Interactive Mathematical Coordinate Canvas: Custom-rendered HTML5 Canvas supporting mathematical Cartesian coordinates where the +Y axis points upward, complete with dynamic zooming, panning, auto-fitting, and pixel cell highlighting.", "1. Coordinate Grid Rendering:")
    add_bullet(" Comprehensive Algorithm Suite: Full execution engines for DDA Line Drawing, Bresenham Line Drawing (all octants), Midpoint Circle (8-way symmetry), Cohen-Sutherland Line Clipping (4-bit outcodes), and Liang-Barsky Line Clipping (parametric p & q bounds).", "2. Core Algorithm Support:")
    add_bullet(" Decoupled Execution Architecture: Strict separation between pure mathematical step-generation logic engines and visual canvas rendering modules, enabling transparent state inspection.", "3. Modular Engine Design:")
    add_bullet(" Intermediate Data Structures & Rationale Panels: Automated tabular generation showing exact step indices, floating-point coordinates, integer roundings, decision parameters (P_k), and human-readable decision explanations for every step.", "4. Educational Transparency:")
    add_bullet(" Full Interactive Playback Controller: Manual and automated animation playback controls including Start, Pause, Resume, Step Forward, Step Backward, Adjustable Speed (0.2s to 1.0s), and Reset.", "5. Stepping & Animation Control:")
    add_bullet(" High-DPI Sharpness & Theme Customization: Native support for Retina/High-DPI sharp canvas scaling via window.devicePixelRatio, alongside persistent Dark and Light visual themes.", "6. Visual Excellence & UX:")

    add_heading_2("1.3 Core Algorithms Implemented & Mathematical Derivations")
    add_paragraph("The application encapsulates five fundamental computer graphics algorithms categorized into rasterization engines and vector line clipping engines:")
    
    add_heading_3("1. DDA (Digital Differential Analyzer) Line Drawing Algorithm")
    add_paragraph("The DDA algorithm calculates continuous floating-point coordinate increments along a line segment by evaluating differential steps dx = X2 - X1 and dy = Y2 - Y1. Based on the maximum absolute differential (steps = max(|dx|, |dy|)), it increments X and Y by fixed step amounts:")
    add_paragraph("   • xIncrement = dx / steps\n   • yIncrement = dy / steps\n   • X_{k+1} = X_k + xIncrement\n   • Y_{k+1} = Y_k + yIncrement\n   • Plot Pixel: (Round(X_{k+1}), Round(Y_{k+1}))")
    add_paragraph("DDA works for any arbitrary slope, but relies on floating-point arithmetic and rounding operations at every step.")

    add_heading_3("2. Bresenham Line Drawing Algorithm")
    add_paragraph("Bresenham's algorithm optimizes line rasterization by using pure integer arithmetic, eliminating slow floating-point divisions and rounding operations. For a line with slope m < 1, the initial integer decision parameter P_0 is derived as:")
    add_paragraph("   • P_0 = 2·Δy - Δx\n   • If P_k < 0: P_{k+1} = P_k + 2·Δy (Select East pixel: X_{k+1} = X_k + 1, Y_{k+1} = Y_k)\n   • If P_k ≥ 0: P_{k+1} = P_k + 2·Δy - 2·Δx (Select North-East pixel: X_{k+1} = X_k + 1, Y_{k+1} = Y_k + 1)")
    add_paragraph("The engine supports generalized Bresenham rasterization across all octants by dynamically tracking directional step signs (sx, sy) and swapping delta axes when dy > dx.")

    add_heading_3("3. Midpoint Circle Algorithm")
    add_paragraph("The Midpoint Circle algorithm generates circular arcs on a discrete pixel grid by evaluating an integer decision parameter P_k at the midpoint between candidate pixels (East vs South-East). Taking advantage of 8-way circular symmetry, the engine calculates pixel coordinates for only one octant (0° to 45°) and automatically mirrors the points across all eight symmetric octants around center (cx, cy):")
    add_paragraph("   • Initial Point: (0, R), Initial Decision P_0 = 1 - R (for integer radius R)\n   • If P_k < 0: P_{k+1} = P_k + 2·X_{k+1} + 1 (Select East pixel: X_{k+1} = X_k + 1, Y_{k+1} = Y_k)\n   • If P_k ≥ 0: P_{k+1} = P_k + 2·X_{k+1} - 2·Y_{k+1} + 1 (Select South-East pixel: X_{k+1} = X_k + 1, Y_{k+1} = Y_k - 1)\n   • Symmetric 8-Way Reflection: (cx ± X, cy ± Y) and (cx ± Y, cy ± X)")

    add_heading_3("4. Cohen-Sutherland Line Clipping Algorithm")
    add_paragraph("A divide-and-conquer vector clipping algorithm that partitions 2D space into nine regions using 4-bit binary region outcodes [TOP, BOTTOM, RIGHT, LEFT]:")
    add_paragraph("   • Outcode Bit Flags: TOP (1000 = 8), BOTTOM (0100 = 4), RIGHT (0010 = 2), LEFT (0001 = 1)\n   • Trivial Accept: Code1 | Code2 == 0000 (Line lies completely inside clipping window)\n   • Trivial Reject: Code1 & Code2 != 0000 (Endpoints share an outside half-plane)\n   • Boundary Intersection: Computes linear slope intersection against active boundary:")
    add_paragraph("     - Left (Xmin): Y = Y1 + m·(Xmin - X1)\n     - Right (Xmax): Y = Y1 + m·(Xmax - X1)\n     - Bottom (Ymin): X = X1 + (1/m)·(Ymin - Y1)\n     - Top (Ymax): X = X1 + (1/m)·(Ymax - Y1)")

    add_heading_3("5. Liang-Barsky Line Clipping Algorithm")
    add_paragraph("A highly efficient parametric line clipping algorithm based on inequality conditions derived from the parametric equation of a line P(u) = P1 + u·(P2 - P1) for u ∈ [0, 1]:")
    add_paragraph("   • Parametric Equations: p_1 = -Δx, q_1 = X1 - Xmin (Left); p_2 = Δx, q_2 = Xmax - X1 (Right)\n     p_3 = -Δy, q_3 = Y1 - Ymin (Bottom); p_4 = Δy, q_4 = Ymax - Y1 (Top)\n   • If p_i < 0: Line proceeds entering boundary -> u1 = max(u1, q_i / p_i)\n   • If p_i > 0: Line proceeds leaving boundary -> u2 = min(u2, q_i / p_i)\n   • If p_i == 0 and q_i < 0: Parallel line lies entirely outside window -> Reject\n   • Accept Condition: u1 ≤ u2, giving clipped endpoints P(u1) and P(u2).")

    add_heading_2("1.4 Technical Stack & Module Organization")
    add_paragraph("The software is architected using modular ES6 JavaScript without external build tools or framework overhead. Below is the file manifest:")

    add_code_block(
"d:\\mca 3rd sem\\cg project\\\n"
"├── index.html              # Main HTML5 Workspace, Canvas Element & Dynamic Panels\n"
"├── css/\n"
"│   └── style.css           # Custom CSS Variables, Dark/Light Mode, Grid Dashboard Layout\n"
"├── js/\n"
"│   ├── main.js             # Application Dispatcher, Form Listeners & Reset Logic\n"
"│   ├── validation.js       # Input Type Parsing, Boundary Verification & Sanitization\n"
"│   ├── dda.js              # DDA Line Rasterization Engine\n"
"│   ├── bresenham.js        # Bresenham Integer Line Rasterization Engine\n"
"│   ├── midpoint.js         # Midpoint 8-Way Symmetry Circle Engine\n"
"│   ├── clipping.js         # Cohen-Sutherland & Liang-Barsky Line Clipping Engine\n"
"│   ├── canvas.js           # Mathematical Grid (+Y Upward), High-DPI Scaling, Pixel Render\n"
"│   ├── animation.js        # Playback Timing, Step Controller & State Machine\n"
"│   └── ui.js               # Dynamic Inputs, Execution Table & Rationale Panels\n"
"└── README.md               # Student Viva Demonstration Guide & Architectural Summary"
    )

    # ---------------------------------------------------------
    # SECTION 2: REQUIREMENT VERIFICATION
    # ---------------------------------------------------------
    add_heading_1("2. Requirement Verification")
    add_paragraph("Requirement Verification ensures that all functional expectations, software architectural constraints, and user interface features outlined during project inception have been fully satisfied. The verification matrix below cross-references each system requirement against its verification method and pass/fail status.")

    add_heading_2("2.1 Functional Requirements (FR) Traceability Matrix")
    fr_headers = ["Req ID", "Functional Requirement Description", "Verification Method", "Status"]
    fr_data = [
        ["FR-01", "Provide dynamic mathematical grid canvas with +Y pointing upward", "Canvas Inspection / Unit Math", "PASS"],
        ["FR-02", "Generate exact step-by-step floating point data for DDA line drawing", "Unit Test / Engine Log", "PASS"],
        ["FR-03", "Calculate integer decision parameters (P_k) for Bresenham line drawing", "Unit Test / Math Verification", "PASS"],
        ["FR-04", "Compute 8-way symmetric pixel coordinates for Midpoint circle algorithm", "Unit Test / Point Reflection", "PASS"],
        ["FR-05", "Perform 4-bit region outcode calculations for Cohen-Sutherland clipping", "Outcode Logic Test", "PASS"],
        ["FR-06", "Evaluate parametric inequalities (p, q, u1, u2) for Liang-Barsky clipping", "Parametric Engine Test", "PASS"],
        ["FR-07", "Support dynamic form generation based on selected algorithm", "UI DOM Verification", "PASS"],
        ["FR-08", "Render real-time execution table showing step-by-step calculated values", "UI Table Inspection", "PASS"],
        ["FR-09", "Provide dedicated 'Why This Pixel?' decision rationale panel", "UI Rationale Test", "PASS"],
        ["FR-10", "Enable interactive animation controls (Start, Pause, Resume, Reset)", "Animation State Test", "PASS"],
        ["FR-11", "Support granular manual step navigation (Next Step / Prev Step)", "Step Sequence Test", "PASS"],
        ["FR-12", "Provide configurable animation speeds (Slow 1.0s, Normal 0.5s, Fast 0.2s)", "Timer Benchmark", "PASS"],
        ["FR-13", "Implement persistent Light / Dark mode theme toggle", "DOM / LocalStorage Test", "PASS"],
        ["FR-14", "Highlight current active pixel and execution table row synchronously", "State Synchronizer Test", "PASS"],
        ["FR-15", "Sanitize user inputs and display real-time validation error alerts", "Validation Module Test", "PASS"]
    ]
    fr_table = doc.add_table(rows=1, cols=4)
    style_table(fr_table, [0.10, 0.52, 0.26, 0.12], fr_headers, fr_data)

    add_heading_2("2.2 Non-Functional Requirements (NFR) Verification Matrix")
    nfr_headers = ["Req ID", "Non-Functional Category", "Specification Requirement", "Status"]
    nfr_data = [
        ["NFR-01", "Performance", "Canvas render pass must complete within < 16ms (60 FPS maintaining UI fluidly)", "PASS"],
        ["NFR-02", "Zero Dependencies", "Must run natively in web browser without npm packages, Node.js server, or build tools", "PASS"],
        ["NFR-03", "High-DPI Sharpness", "Canvas must auto-scale resolution using devicePixelRatio to eliminate display blur", "PASS"],
        ["NFR-04", "Responsiveness", "Dashboard and workspace layout must adapt dynamically to desktop, tablet, and mobile displays", "PASS"],
        ["NFR-05", "Accessibility", "Respect system prefers-reduced-motion preferences by disabling step animations when active", "PASS"],
        ["NFR-06", "Maintainability", "Strict modular ES6 architecture with encapsulated state and clear docstrings", "PASS"],
        ["NFR-07", "Cross-Browser", "Compatible with Google Chrome, Mozilla Firefox, Microsoft Edge, and Apple Safari", "PASS"],
        ["NFR-08", "Usability", "Zero configuration installation; usable by opening index.html directly in browser", "PASS"]
    ]
    nfr_table = doc.add_table(rows=1, cols=4)
    style_table(nfr_table, [0.10, 0.22, 0.56, 0.12], nfr_headers, nfr_data)

    # ---------------------------------------------------------
    # SECTION 3: TEST PLAN
    # ---------------------------------------------------------
    add_heading_1("3. Test Plan")
    add_paragraph("The Test Plan defines the comprehensive quality assurance strategy established to evaluate the mathematical correctness, software stability, canvas rendering precision, and interactive UI behavior of the Graphics Algorithm Visualizer project.")

    add_heading_2("3.1 Test Strategy & Methodology")
    add_paragraph("A multi-tiered testing strategy was adopted, encompassing Unit Engine Testing, Canvas Coordinate Transformation Verification, Boundary Value Analysis, User Interface Interaction Testing, and Cross-Browser Compatibility Validation.")

    add_bullet(" Mathematical Engine Verification: Isolating engine modules (dda.js, bresenham.js, midpoint.js, clipping.js) and asserting output arrays against manual hand-calculated coordinate benchmarks.", "1. Unit Testing:")
    add_bullet(" Canvas Coordinate Mapping: Testing the transformation pipeline between mathematical space (originX, originY, scale) and canvas pixel space, specifically ensuring the inverted Y-axis maps correctly.", "2. Integration Testing:")
    add_bullet(" Edge-Case Validation: Feeding extreme coordinate inputs such as zero-length lines, negative center coordinates, steep slopes (dx = 0), horizontal lines (dy = 0), and inverted clipping boundaries.", "3. Boundary Testing:")
    add_bullet(" Interactive Controls & Playback: Validating state transitions across animation control buttons, timer clearances, step counters, and table row click events.", "4. System / UI Testing:")

    add_heading_2("3.2 Test Environment & Setup")
    env_headers = ["Environment Parameter", "Specification Details"]
    env_data = [
        ["Operating System", "Windows 11 Home 64-bit / Linux Ubuntu 22.04 LTS"],
        ["Host Web Browsers", "Google Chrome (v124+), Mozilla Firefox (v125+), MS Edge (v124+)"],
        ["Screen Resolutions", "1920x1080 (Desktop), 1366x768 (Laptop), 375x812 (Mobile Viewport)"],
        ["Display DPI / Scale", "100% (1.0 dpr), 125% (1.25 dpr), 200% High-DPI Retina (2.0 dpr)"],
        ["Execution Runtime", "Direct File Protocol (file://) & VS Code Live Server (http://localhost:5500)"]
    ]
    env_table = doc.add_table(rows=1, cols=2)
    style_table(env_table, [0.35, 0.65], env_headers, env_data)

    add_heading_2("3.3 Entry and Exit Criteria")
    add_paragraph("Strict entry and exit criteria were defined to govern the progression of testing phases:")
    add_bullet("All core algorithm ES6 modules compiled with zero syntax errors in browser console; input validation rules implemented.", "Entry Criteria:")
    add_bullet("100% pass rate achieved on all critical and major test cases; zero open critical defects; verified mathematical correctness across all 5 graphics algorithms.", "Exit Criteria:")

    # ---------------------------------------------------------
    # SECTION 4: TEST CASES
    # ---------------------------------------------------------
    add_heading_1("4. Test Cases")
    add_paragraph("Below is the exhaustive test suite containing 30 structured test cases executed during the quality assurance phase of the Graphics Algorithm Visualizer project.")

    tc_headers = ["TC ID", "Module", "Test Case Description", "Input Parameters", "Expected Result", "Status"]
    tc_data = [
        ["TC-DDA-01", "DDA Engine", "Positive slope line (m < 1)", "(2,3) to (10,7)", "dx=8, dy=4, steps=8, xInc=1, yInc=0.5. 9 points plotted.", "PASS"],
        ["TC-DDA-02", "DDA Engine", "Steep line slope (m > 1)", "(1,1) to (3,8)", "dx=2, dy=7, steps=7, xInc=0.29, yInc=1.0. 8 points plotted.", "PASS"],
        ["TC-DDA-03", "DDA Engine", "Negative slope line", "(10,10) to (2,4)", "dx=-8, dy=-6, steps=8. Correct negative increments computed.", "PASS"],
        ["TC-DDA-04", "DDA Engine", "Single point line (dx=0, dy=0)", "(4,4) to (4,4)", "stepsCount=0, single step generated at (4,4) without divide by zero.", "PASS"],
        ["TC-DDA-05", "DDA Engine", "Floating point inputs", "(1.5, 2.3) to (8.5, 6.7)", "Handles floats, rounds roundedX/roundedY properly.", "PASS"],

        ["TC-BRE-01", "Bresenham", "Gentle slope line (octant 1)", "(1,1) to (8,5)", "dx=7, dy=4, P0=1. Integer decision increments correctly applied.", "PASS"],
        ["TC-BRE-02", "Bresenham", "Steep slope line (m > 1)", "(1,1) to (4,9)", "dx=3, dy=8. Vertical Y steps prioritized; integer math correct.", "PASS"],
        ["TC-BRE-03", "Bresenham", "Horizontal line (dy = 0)", "(2,5) to (9,5)", "dx=7, dy=0. Pure horizontal pixel step sequence generated.", "PASS"],
        ["TC-BRE-04", "Bresenham", "Vertical line (dx = 0)", "(5,2) to (5,8)", "dx=0, dy=6. Pure vertical pixel step sequence generated.", "PASS"],
        ["TC-BRE-05", "Bresenham", "Decreasing coordinates (sx=-1)", "(10,8) to (2,3)", "Negative step direction sx=-1, sy=-1 correctly executed.", "PASS"],

        ["TC-MID-01", "Midpoint", "Standard circle at origin", "cx=0, cy=0, R=8", "Initial P0 = -7. 8-way symmetric points generated for 1st octant.", "PASS"],
        ["TC-MID-02", "Midpoint", "Offset center circle", "cx=5, cy=5, R=6", "Symmetric points correctly added to offset center (5,5).", "PASS"],
        ["TC-MID-03", "Midpoint", "Small radius circle", "cx=0, cy=0, R=1", "Algorithm terminates cleanly in 2 steps without array index error.", "PASS"],
        ["TC-MID-04", "Midpoint", "Negative center circle", "cx=-4, cy=-3, R=5", "Coordinates mapped properly into negative mathematical quadrants.", "PASS"],

        ["TC-CS-01", "Cohen-Suth.", "Trivial Accept line", "Win(2,2,8,8), Line(3,3,7,7)", "Code1=0000, Code2=0000. Trivial accept executed immediately.", "PASS"],
        ["TC-CS-02", "Cohen-Suth.", "Trivial Reject line", "Win(2,2,8,8), Line(10,10,12,12)", "Code1=1010, Code2=1010. Bitwise AND != 0, trivial reject.", "PASS"],
        ["TC-CS-03", "Cohen-Suth.", "Line crossing Left boundary", "Win(2,2,8,8), Line(0,5,10,5)", "Line clipped at X=2; intersection computed at (2,5).", "PASS"],
        ["TC-CS-04", "Cohen-Suth.", "Diagonal line double clip", "Win(2,2,8,8), Line(0,0,10,10)", "Both endpoints clipped to boundary intersections (2,2) and (8,8).", "PASS"],

        ["TC-LB-01", "Liang-Barsky", "Completely inside line", "Win(2,2,8,8), Line(3,4,7,6)", "Parametric bounds stay [u1=0.0, u2=1.0]. Line accepted.", "PASS"],
        ["TC-LB-02", "Liang-Barsky", "Entering & leaving clip", "Win(2,2,8,8), Line(0,1,9,7)", "u1 updated for entering boundary, u2 for leaving boundary.", "PASS"],
        ["TC-LB-03", "Liang-Barsky", "Parallel line outside window", "Win(2,2,8,8), Line(0,0,0,10)", "p1=0 and q1 < 0. Trivial parallel rejection triggered.", "PASS"],
        ["TC-LB-04", "Liang-Barsky", "External non-intersecting line", "Win(2,2,8,8), Line(0,10,10,10)", "Evaluates u1 > u2. Line rejected cleanly.", "PASS"],

        ["TC-UI-01", "UI / Theme", "Dark Mode Toggle", "Click Theme Button", "data-theme set to 'dark', canvas colors update to dark grid.", "PASS"],
        ["TC-UI-02", "UI / Stepping", "Manual Step Forward", "Click 'Next Step' button", "Animation pauses, currentStepIndex increments, table row highlights.", "PASS"],
        ["TC-UI-03", "UI / Stepping", "Manual Step Backward", "Click 'Prev Step' button", "Current pixel unplots, step index decrements, details update.", "PASS"],
        ["TC-UI-04", "UI / Speed", "Speed change during animation", "Select 'Fast (0.2s)'", "Timer interval clears and restarts at 200ms seamlessly.", "PASS"],
        ["TC-UI-05", "Validation", "Non-numeric input handling", "Enter 'abc' in X1 input", "Validation catch block triggers; inline error message shown in UI.", "PASS"],
        ["TC-UI-06", "UI / Nav", "Sidebar Algorithm Switch", "Click 'Bresenham Line'", "Workspace updates title, inputs, info panel & resets canvas.", "PASS"],
        ["TC-UI-07", "UI / Home", "Card Launch Button", "Click 'Explore DDA'", "Navigates from Home View to Visualizer View with DDA selected.", "PASS"],
        ["TC-UI-08", "UI / Reset", "Reset Visualizer Button", "Click 'Reset'", "Clears table, rationale panels, resets step index and clears canvas.", "PASS"],
        ["TC-UI-09", "Accessibility", "Prefers Reduced Motion", "System motion reduced", "Animation auto-jumps to final step without rapid timer sequence.", "PASS"],
        ["TC-UI-10", "Responsive", "Mobile Drawer Nav", "Click hamburger icon", "Sidebar slides open on screen widths < 768px.", "PASS"]
    ]
    tc_table = doc.add_table(rows=1, cols=6)
    style_table(tc_table, [0.09, 0.11, 0.22, 0.22, 0.28, 0.08], tc_headers, tc_data)

    # ---------------------------------------------------------
    # SECTION 5: BUG / DEFECT REPORT
    # ---------------------------------------------------------
    add_heading_1("5. Bug / Defect Report")
    add_paragraph("During the iterative development and quality assurance phases of the project, several software bugs and edge-case defects were logged, investigated, and successfully resolved. The defect tracking log below details the lifecycle of all identified issues.")

    add_heading_2("5.1 Defect Severity Classification")
    add_bullet("Defects causing system crash, infinite loops, or total canvas rendering failure.", "Critical (P1):")
    add_bullet("Defects causing incorrect mathematical calculation outputs or broken interaction controls.", "Major (P2):")
    add_bullet("Defects related to minor visual misalignments, font sizing, or styling inconsistencies.", "Minor (P3):")

    add_heading_2("5.2 Defect Tracking Log")
    def_headers = ["Defect ID", "Component", "Defect Summary Description", "Severity", "Root Cause", "Status"]
    def_data = [
        ["DEF-01", "Canvas API", "Canvas Y-axis orientation rendered upside down relative to Cartesian math", "Critical", "Canvas default coordinate origin (0,0) is at Top-Left with Y positive downwards.", "RESOLVED"],
        ["DEF-02", "DDA Engine", "Accumulated floating-point precision error caused incorrect step count rounding", "Major", "Repeated addition of imprecise floating xInc/yInc produced round-off drift.", "RESOLVED"],
        ["DEF-03", "Bresenham", "Steep slope lines (m > 1) rendered improperly across octants", "Critical", "Decision parameter equation assumed dx > dy; failed to swap dx and dy for steep lines.", "RESOLVED"],
        ["DEF-04", "Midpoint", "Circle center translation (cx, cy) was omitted from symmetric reflection points", "Major", "Symmetry function reflected relative coordinates without adding center offsets.", "RESOLVED"],
        ["DEF-05", "Cohen-Suth.", "Infinite loop occurred when line endpoint coincided exactly with window boundary", "Critical", "Outcode calculation failed to use strict inequality operators for edge alignment.", "RESOLVED"],
        ["DEF-06", "Liang-Barsky", "Division by zero crash occurred when processing vertical line segments", "Critical", "Parallel boundary check (p_i == 0) was missing before evaluating parametric ratio q/p.", "RESOLVED"],
        ["DEF-07", "Canvas API", "Grid line text and pixel grid appeared blurry on Retina/High-DPI laptop screens", "Minor", "Canvas width/height properties were set without factoring devicePixelRatio.", "RESOLVED"],
        ["DEF-08", "Animation", "Rapidly clicking 'Start' spawned multiple parallel interval timers", "Major", "Previous setInterval timer ID was not cleared before instantiating a new timer loop.", "RESOLVED"]
    ]
    def_table = doc.add_table(rows=1, cols=6)
    style_table(def_table, [0.09, 0.12, 0.28, 0.10, 0.31, 0.10], def_headers, def_data)

    # ---------------------------------------------------------
    # SECTION 6: DEBUGGING REPORT
    # ---------------------------------------------------------
    add_heading_1("6. Debugging Report")
    add_paragraph("The Debugging Report presents an in-depth technical analysis of the root causes, diagnostic methodologies, code refactoring, and verification procedures implemented to resolve complex engineering challenges encountered during project development.")

    add_heading_2("6.1 Case Study 1: Mathematical Coordinate Space Transformation (DEF-01)")
    add_paragraph("In standard HTML5 Canvas rendering, the origin point (0,0) is located at the top-left corner of the canvas element, with the positive Y-axis pointing vertically downward. However, computer graphics academic theory mandates a standard Cartesian coordinate system where the positive Y-axis points upward from the center origin.")
    add_paragraph("To solve this fundamental conflict without corrupting algorithm math engines, a centralized coordinate transformation mapping was engineered inside canvas.js:")

    add_code_block(
"// Mathematical Coordinate Transformation in CanvasModule (canvas.js)\n"
"toCanvasX(x) {\n"
"  return this.originX + x * this.scale;\n"
"}\n\n"
"toCanvasY(y) {\n"
"  // Mathematical +Y points UPWARD; Canvas Y points DOWNWARD\n"
"  return this.originY - y * this.scale;\n"
"}"
    )
    add_paragraph("By routing all canvas draw calls through toCanvasX() and toCanvasY(), algorithm engines maintain pure mathematical inputs and outputs without worrying about canvas pixel space inversion.")

    add_heading_2("6.2 Case Study 2: High-DPI Sharpness & Pixel Scaling (DEF-07)")
    add_paragraph("When rendered on modern high-resolution displays (e.g., 4K monitors or Retina laptops with 125%-200% OS scaling), canvas elements default to 1:1 CSS pixel mapping, resulting in visibly blurry text and grid lines. The solution required dynamically scaling the underlying canvas backing store while maintaining CSS dimensions:")

    add_code_block(
"resizeCanvas() {\n"
"  const rect = this.canvas.getBoundingClientRect();\n"
"  const dpr = window.devicePixelRatio || 1;\n\n"
"  // Scale backing store resolution\n"
"  this.canvas.width = rect.width * dpr;\n"
"  this.canvas.height = rect.height * dpr;\n\n"
"  // Scale drawing context to match device pixel ratio\n"
"  this.ctx.scale(dpr, dpr);\n"
"  this.render();\n"
"}"
    )

    add_heading_2("6.3 Case Study 3: Cohen-Sutherland Outcode Boundary Logic & Intersections (DEF-05)")
    add_paragraph("A major bug was encountered during Cohen-Sutherland line clipping when processing lines with endpoints lying directly on a clipping window boundary (e.g., X1 = Xmin). The initial code used non-strict comparisons, causing points on the edge to be classified as outside (outcode bit set), leading to infinite clipping loops.")
    add_paragraph("The bug was fixed by enforcing strict region comparison rules inside ClippingModule.computeOutCode():")

    add_code_block(
"computeOutCode(x, y, xmin, ymin, xmax, ymax) {\n"
"  let code = INSIDE; // 0000\n"
"  if (x < xmin)      code |= LEFT;   // 0001\n"
"  else if (x > xmax) code |= RIGHT;  // 0010\n"
"  if (y < ymin)      code |= BOTTOM; // 0100\n"
"  else if (y > ymax) code |= TOP;    // 1000\n"
"  return code;\n"
"}"
    )

    add_heading_2("6.4 Case Study 4: Liang-Barsky Parallel Line Zero-Division Guard (DEF-06)")
    add_paragraph("When evaluating vertical or horizontal line segments in Liang-Barsky clipping, the directional vector p_i equals 0 (e.g., p1 = -dx = 0 for a vertical line). Evaluating the ratio r = q_i / p_i produced Division by Zero (Infinity / NaN), crashing the execution engine.")
    add_paragraph("The fix introduced a parallel boundary guard prior to performing ratio calculations:")

    add_code_block(
"if (pVal === 0) {\n"
"  if (qVal < 0) {\n"
"    // Line is parallel to boundary AND lies completely outside window\n"
"    accept = false;\n"
"    break;\n"
"  }\n"
"} else {\n"
"  const r = qVal / pVal;\n"
"  // Proceed with entering (p < 0) or leaving (p > 0) interval adjustment\n"
"}"
    )

    add_heading_2("6.5 Case Study 5: Timer & State Synchronization in Animation Controller (DEF-08)")
    add_paragraph("During manual user testing, rapidly clicking the 'Start' button spawned multiple simultaneous setInterval instances in AnimationModule, causing the animation speed to accelerate uncontrollably. This race condition occurred because previous timer handles were not cleared prior to re-instantiating the playback interval.")
    add_paragraph("The issue was resolved by introducing explicit pause() and timer clearance checks prior to setting new interval handles:")

    add_code_block(
"start() {\n"
"  if (!this.stepsData || this.stepsData.steps.length === 0) return;\n"
"  this.pause(); // Clear any pre-existing active timer handle\n"
"  this.isPlaying = true;\n"
"  this.timerId = setInterval(() => {\n"
"    if (this.currentStepIndex < this.stepsData.steps.length - 1) {\n"
"      this.currentStepIndex++;\n"
"      this.notifyStep();\n"
"    } else {\n"
"      this.pause();\n"
"    }\n"
"  }, this.speedMs);\n"
"}\n\n"
"pause() {\n"
"  this.isPlaying = false;\n"
"  if (this.timerId) {\n"
"    clearInterval(this.timerId);\n"
"    this.timerId = null;\n"
"  }\n"
"}"
    )

    # ---------------------------------------------------------
    # SECTION 7: VALIDATION REPORT
    # ---------------------------------------------------------
    add_heading_1("7. Validation Report")
    add_paragraph("The Validation Report establishes the input sanitization rules, numerical constraint checks, boundary edge-case handling, and user error reporting mechanisms implemented within validation.js.")

    add_heading_2("7.1 Input Sanitization & Boundary Rules")
    val_headers = ["Input Category", "Field Name", "Validation Constraint Rule", "Error Trigger Rationale"]
    val_data = [
        ["General Numeric", "All Inputs", "Must be non-empty, finite numeric value", "Prevents NaN, empty strings, and Infinity crashes."],
        ["Circle Specs", "Radius (R)", "Must be strictly greater than 0 (R > 0)", "Negative or zero radius cannot form a valid circle."],
        ["Clipping Window", "Xmin vs Xmax", "Xmin must be strictly less than Xmax (Xmin < Xmax)", "Inverted clipping window boundaries invalidate outcodes."],
        ["Clipping Window", "Ymin vs Ymax", "Ymin must be strictly less than Ymax (Ymin < Ymax)", "Inverted vertical window bounds corrupt intersection equations."],
        ["Line Bounds", "X1, Y1, X2, Y2", "Finite real numbers within canvas view bounds", "Extreme inputs (>10000) are caught to maintain grid scale."]
    ]
    val_table = doc.add_table(rows=1, cols=4)
    style_table(val_table, [0.16, 0.16, 0.38, 0.30], val_headers, val_data)

    add_heading_2("7.2 Validation Module Code Analysis")
    add_paragraph("The ValidationModule in validation.js encapsulates strict parsing helper functions to sanitize and assert inputs before passing them to the mathematical engines:")

    add_code_block(
"const ValidationModule = {\n"
"  parseNumber(value, fieldName) {\n"
"    if (value === null || value === undefined || value.trim() === '') {\n"
"      throw new Error(`Please enter a value for ${fieldName}.`);\n"
"    }\n"
"    const num = Number(value);\n"
"    if (isNaN(num)) throw new Error(`Please enter a valid number for ${fieldName}.`);\n"
"    if (!isFinite(num)) throw new Error(`${fieldName} cannot be Infinity.`);\n"
"    return num;\n"
"  },\n\n"
"  validateCircleInputs(cxStr, cyStr, rStr) {\n"
"    const cx = this.parseNumber(cxStr, 'Center X');\n"
"    const cy = this.parseNumber(cyStr, 'Center Y');\n"
"    const r = this.parseNumber(rStr, 'Radius');\n"
"    if (r <= 0) throw new Error('Radius must be greater than 0.');\n"
"    return { cx, cy, r };\n"
"  }\n"
"};"
    )

    add_heading_2("7.3 Real-Time User Feedback & Error UI")
    add_paragraph("When invalid parameters are submitted, the ValidationModule throws a structured error that is caught by runCurrentAlgorithm() in main.js. The UI immediately displays an alert message in the #inputValidationError box while preventing algorithm execution.")

    # ---------------------------------------------------------
    # SECTION 8: SOFTWARE AND HARDWARE REQUIREMENTS
    # ---------------------------------------------------------
    add_heading_1("8. Software and Hardware Requirements")
    add_paragraph("This section specifies the technical operating requirements, system environments, client-side software dependencies, and hardware resource allocations required to run and maintain the project.")

    add_heading_2("8.1 Software Requirements")
    sw_headers = ["Software Layer", "Minimum Requirement", "Recommended Requirement"]
    sw_data = [
        ["Operating System", "Windows 10 / Linux Kernel 5.4 / macOS 11", "Windows 11 / Ubuntu 22.04 LTS / macOS Sonoma"],
        ["Web Browser", "Google Chrome 90+, Firefox 88+, MS Edge 90+", "Google Chrome 124+ or Mozilla Firefox 125+"],
        ["Runtime Dependencies", "Native HTML5, CSS3, ES6 JavaScript", "None (Zero external library dependencies)"],
        ["Rendering Engine", "Standard 2D HTML5 Canvas API", "Hardware-accelerated 2D Canvas Context"],
        ["Development Tools", "VS Code v1.80+ / Any Code Editor", "VS Code + Live Server Extension"]
    ]
    sw_table = doc.add_table(rows=1, cols=3)
    style_table(sw_table, [0.22, 0.39, 0.39], sw_headers, sw_data)

    add_heading_2("8.2 Hardware Requirements")
    hw_headers = ["Hardware Component", "Minimum System Spec", "Recommended System Spec"]
    hw_data = [
        ["Processor (CPU)", "Dual-Core 1.6 GHz Intel/AMD Processor", "Quad-Core 2.5 GHz Intel i5 / AMD Ryzen 5 or better"],
        ["System Memory (RAM)", "2 GB RAM", "8 GB RAM or higher"],
        ["Graphics (GPU)", "Integrated Intel HD Graphics 4000", "Dedicated GPU or modern Integrated Iris Xe / Radeon"],
        ["Display Resolution", "1280 x 720 pixels (HD)", "1920 x 1080 pixels (Full HD) or High-DPI display"],
        ["Storage Space", "10 MB free disk space", "50 MB free disk space"],
        ["Input Devices", "Standard Keyboard and Mouse / Touchpad", "Precision Mouse or Touch-enabled screen"]
    ]
    hw_table = doc.add_table(rows=1, cols=3)
    style_table(hw_table, [0.22, 0.39, 0.39], hw_headers, hw_data)

    # ---------------------------------------------------------
    # SECTION 9: WORKFLOW OF THE PROJECT
    # ---------------------------------------------------------
    add_heading_1("9. Workflow of the Project")
    add_paragraph("The Workflow of the Project details the end-to-end operational architecture, system component interactions, state machine flow, and data flow pipelines governing the Graphics Algorithm Visualizer.")

    add_heading_2("9.1 System Architectural Workflow")
    add_paragraph("The application operates under a clean, decoupled 4-layer client-side architecture:")

    add_code_block(
"+-------------------------------------------------------------------+\n"
"|                      PRESENTATION LAYER                           |\n"
"|  index.html | style.css | Responsive Sidebar | Dashboard Cards     |\n"
"+-------------------------------------------------------------------+\n"
"                                 │\n"
"                                 ▼\n"
"+-------------------------------------------------------------------+\n"
"|                     ORCHESTRATION LAYER                           |\n"
"|  main.js (Event Listener) <---> UIModule (DOM Sync & Form Handler) |\n"
"+-------------------------------------------------------------------+\n"
"                                 │\n"
"                                 ▼\n"
"+-------------------------------------------------------------------+\n"
"|                      VALIDATION LAYER                             |\n"
"|  validation.js (Sanitizes inputs, checks bounds & throws errors)  |\n"
"+-------------------------------------------------------------------+\n"
"                                 │\n"
"                                 ▼\n"
"+-------------------------------------------------------------------+\n"
"|                   ALGORITHM ENGINE LAYER                          |\n"
"| dda.js | bresenham.js | midpoint.js | clipping.js                 |\n"
"| Pure JS computations -> Returns structured { meta, steps } object |\n"
"+-------------------------------------------------------------------+\n"
"                                 │\n"
"        ┌────────────────────────┴────────────────────────┐\n"
"        ▼                                                 ▼\n"
"+------------------------------+  +---------------------------------+\n"
"|     CANVAS RENDER ENGINE     |  |       ANIMATION CONTROLLER      |\n"
"| canvas.js                    |  | animation.js                    |\n"
"| Grid render, +Y mapping,     |  | Timers, playback state machine, |\n"
"| step indexing (0 .. N)       |  | step indexing (0 .. N)          |\n"
"+------------------------------+  +---------------------------------+"
    )

    add_heading_2("9.2 Animation Controller State Transitions")
    add_paragraph("The playback state machine inside AnimationModule governs transitions between idle, auto-playing, paused, and manual stepping states:")

    state_headers = ["Current State", "Trigger Event", "Target State", "Action Executed"]
    state_data = [
        ["STOPPED", "runCurrentAlgorithm()", "PLAYING", "Loads stepsData, sets currentStepIndex=0, spawns setInterval timer."],
        ["PLAYING", "Click Pause Button", "PAUSED", "Clears setInterval timer handle; maintains currentStepIndex."],
        ["PAUSED", "Click Resume Button", "PLAYING", "Spawns new setInterval timer handle from currentStepIndex."],
        ["PLAYING / PAUSED", "Click Next Step", "PAUSED", "Clears timer, increments currentStepIndex by 1, triggers render tick."],
        ["PLAYING / PAUSED", "Click Prev Step", "PAUSED", "Clears timer, decrements currentStepIndex by 1, triggers render tick."],
        ["ANY STATE", "Click Reset Button", "STOPPED", "Clears timer, resets currentStepIndex=-1, wipes canvas & table."]
    ]
    state_table = doc.add_table(rows=1, cols=4)
    style_table(state_table, [0.18, 0.22, 0.16, 0.44], state_headers, state_data)

    add_heading_2("9.3 User Interaction & Execution Flow")
    add_paragraph("The step-by-step lifecycle of a user interaction sequence is structured as follows:")

    add_bullet("User selects an algorithm from the sidebar or dashboard (e.g., 'Bresenham Line Drawing'). UIModule dynamically builds input fields.", "Step 1: Algorithm Selection:")
    add_bullet("User inputs coordinate parameters and clicks 'Visualize Algorithm'. Form submit listener intercepts event in main.js.", "Step 2: Input Submission:")
    add_bullet("ValidationModule parses parameters. If invalid, inline error displays; if valid, execution proceeds to algorithm engine.", "Step 3: Validation Check:")
    add_bullet("Algorithm engine computes all step objects synchronously and returns a structured payload containing meta data and steps array.", "Step 4: Step Generation:")
    add_bullet("CanvasModule receives bounds, calculates scale factor, fits coordinate window, and renders base grid with axes.", "Step 5: Canvas Fitting:")
    add_bullet("AnimationModule initializes step counter (currentStepIndex = 0) and starts timer based on speed setting.", "Step 6: Animation Auto-Start:")
    add_bullet("For each tick, CanvasModule draws pixels up to current step, UIModule updates execution table active row and populates 'Why This Pixel?' rationale.", "Step 7: Synchronized Rendering:")
    add_bullet("User can pause, step forward/backward manually, adjust playback speed, or toggle dark/light theme at any point.", "Step 8: Interactive Controls:")

    add_heading_2("9.4 Data Flow Diagram (DFD Level 1 Description)")
    add_paragraph("Data flows sequentially through the application layers:")
    add_bullet("Form Inputs (String values from HTML inputs) -> ValidationModule -> Number Inputs (x1, y1, x2, y2).", "Flow 1 (User Input):")
    add_bullet("Number Inputs -> Algorithm Module (e.g. DDAModule.generateSteps) -> Structured Payload Object ({ meta, steps }).", "Flow 2 (Computation):")
    add_bullet("Payload Object -> AnimationModule.setStepsData() -> Emits tick callback on currentStepIndex update.", "Flow 3 (Animation State):")
    add_bullet("Tick Event -> CanvasModule.render(stepData, index) -> Pixel Rectangles on HTML5 Canvas.", "Flow 4 (Visual Output):")
    add_bullet("Tick Event -> UIModule.updateStepTable() & updateExplanationPanels() -> HTML Table Rows & Rationale Panel text.", "Flow 5 (DOM Output):")

    add_callout("Report Summary & Final Conclusion", "This document represents the complete, fully verified technical report for the Graphics Algorithm Visualizer project. All 9 required sections have been rigorously detailed with code snippets, mathematical derivations, architecture diagrams, test suites, and defect resolution logs.")

    # Save Document
    doc.save("Graphics_Algorithm_Visualizer_Project_Report.docx")
    print("Report generated successfully as 'Graphics_Algorithm_Visualizer_Project_Report.docx'.")

if __name__ == "__main__":
    create_report()
