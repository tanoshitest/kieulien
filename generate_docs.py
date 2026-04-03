#!/usr/bin/env python3
"""Generate MENGLISH Product Documentation PDF for customers."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
import os

# ── Colors ──
PRIMARY = HexColor("#6366F1")       # Indigo
PRIMARY_LIGHT = HexColor("#EEF2FF")
PRIMARY_DARK = HexColor("#4338CA")
ACCENT = HexColor("#10B981")        # Emerald
ACCENT_LIGHT = HexColor("#ECFDF5")
WARN = HexColor("#F59E0B")
WARN_LIGHT = HexColor("#FFFBEB")
ROSE = HexColor("#F43F5E")
ROSE_LIGHT = HexColor("#FFF1F2")
DARK = HexColor("#0F172A")
GRAY = HexColor("#64748B")
GRAY_LIGHT = HexColor("#F1F5F9")
BORDER = HexColor("#E2E8F0")
TEXT = HexColor("#1E293B")
WHITE = white

WIDTH, HEIGHT = A4

# ── Styles ──
def make_styles():
    s = {}
    s['title'] = ParagraphStyle('title', fontName='Helvetica-Bold', fontSize=28, leading=34,
                                 textColor=DARK, alignment=TA_LEFT)
    s['subtitle'] = ParagraphStyle('subtitle', fontName='Helvetica', fontSize=13, leading=18,
                                    textColor=GRAY, alignment=TA_LEFT)
    s['h1'] = ParagraphStyle('h1', fontName='Helvetica-Bold', fontSize=20, leading=26,
                              textColor=DARK, spaceBefore=24, spaceAfter=10)
    s['h2'] = ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=15, leading=20,
                              textColor=PRIMARY_DARK, spaceBefore=16, spaceAfter=6)
    s['h3'] = ParagraphStyle('h3', fontName='Helvetica-Bold', fontSize=12, leading=16,
                              textColor=DARK, spaceBefore=10, spaceAfter=4)
    s['body'] = ParagraphStyle('body', fontName='Helvetica', fontSize=10, leading=15,
                                textColor=TEXT, alignment=TA_JUSTIFY, spaceAfter=4)
    s['body_bold'] = ParagraphStyle('body_bold', fontName='Helvetica-Bold', fontSize=10,
                                     leading=15, textColor=TEXT, spaceAfter=4)
    s['bullet'] = ParagraphStyle('bullet', fontName='Helvetica', fontSize=10, leading=15,
                                  textColor=TEXT, leftIndent=16, bulletIndent=6,
                                  spaceAfter=3, alignment=TA_LEFT)
    s['bullet2'] = ParagraphStyle('bullet2', fontName='Helvetica', fontSize=9.5, leading=14,
                                   textColor=GRAY, leftIndent=32, bulletIndent=22,
                                   spaceAfter=2, alignment=TA_LEFT)
    s['small'] = ParagraphStyle('small', fontName='Helvetica', fontSize=8.5, leading=12,
                                 textColor=GRAY, alignment=TA_LEFT)
    s['caption'] = ParagraphStyle('caption', fontName='Helvetica-Oblique', fontSize=9,
                                   leading=13, textColor=GRAY, alignment=TA_CENTER, spaceAfter=8)
    s['toc'] = ParagraphStyle('toc', fontName='Helvetica', fontSize=11, leading=18,
                               textColor=TEXT, leftIndent=10, spaceAfter=2)
    s['toc_h'] = ParagraphStyle('toc_h', fontName='Helvetica-Bold', fontSize=11, leading=18,
                                 textColor=PRIMARY_DARK, spaceAfter=2)
    s['footer'] = ParagraphStyle('footer', fontName='Helvetica', fontSize=8, leading=10,
                                  textColor=GRAY, alignment=TA_CENTER)
    s['tag'] = ParagraphStyle('tag', fontName='Helvetica-Bold', fontSize=8, leading=11,
                               textColor=PRIMARY_DARK, alignment=TA_LEFT)
    return s

ST = make_styles()

# ── Helpers ──
def colored_box(text, bg_color, text_color=WHITE, width=None):
    """Create a colored info box."""
    style = ParagraphStyle('box', fontName='Helvetica', fontSize=10, leading=15,
                            textColor=text_color, alignment=TA_LEFT)
    p = Paragraph(text, style)
    w = width or (WIDTH - 60)
    t = Table([[p]], colWidths=[w], rowHeights=None)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_color),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
    ]))
    return t

def feature_card(title, items, accent=PRIMARY):
    """Create a feature card with title and bullet list."""
    elements = []
    title_style = ParagraphStyle('card_title', fontName='Helvetica-Bold', fontSize=11,
                                  leading=15, textColor=accent)
    elements.append(Paragraph(title, title_style))
    elements.append(Spacer(1, 4))
    for item in items:
        elements.append(Paragraph(f"\xe2\x80\xa2  {item}", ST['bullet']))
    return KeepTogether(elements)

def role_tag(text, color):
    style = ParagraphStyle('role_tag', fontName='Helvetica-Bold', fontSize=8, leading=10,
                            textColor=WHITE, alignment=TA_CENTER)
    p = Paragraph(text, style)
    t = Table([[p]], colWidths=[80], rowHeights=[18])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), color),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    return t

def divider():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceBefore=10, spaceAfter=10)

def section_header(number, title):
    """Section header with number circle."""
    num_style = ParagraphStyle('num', fontName='Helvetica-Bold', fontSize=12, textColor=WHITE, alignment=TA_CENTER)
    title_style = ParagraphStyle('sec_title', fontName='Helvetica-Bold', fontSize=16, leading=22, textColor=DARK)

    num_p = Paragraph(str(number), num_style)
    title_p = Paragraph(title, title_style)

    t = Table([[num_p, title_p]], colWidths=[36, WIDTH - 96])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), PRIMARY),
        ('ROUNDEDCORNERS', [18, 18, 18, 18]),
        ('TOPPADDING', (0, 0), (0, 0), 7),
        ('BOTTOMPADDING', (0, 0), (0, 0), 7),
        ('LEFTPADDING', (0, 0), (0, 0), 0),
        ('RIGHTPADDING', (0, 0), (0, 0), 0),
        ('ALIGN', (0, 0), (0, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (1, 0), (1, 0), 12),
    ]))
    return t

# ── Page callbacks ──
def cover_page(canvas_obj, doc):
    canvas_obj.saveState()
    # Top accent bar
    canvas_obj.setFillColor(PRIMARY)
    canvas_obj.rect(0, HEIGHT - 8*mm, WIDTH, 8*mm, fill=1, stroke=0)
    # Bottom bar
    canvas_obj.setFillColor(PRIMARY_LIGHT)
    canvas_obj.rect(0, 0, WIDTH, 30*mm, fill=1, stroke=0)
    canvas_obj.setFillColor(GRAY)
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.drawCentredString(WIDTH/2, 12*mm, "MENGLISH \xe2\x80\x94 Tai lieu noi bo \xe2\x80\x94 Phien ban 1.0 \xe2\x80\x94 Thang 03/2026")
    canvas_obj.restoreState()

def normal_page(canvas_obj, doc):
    canvas_obj.saveState()
    # Top line
    canvas_obj.setStrokeColor(PRIMARY)
    canvas_obj.setLineWidth(2)
    canvas_obj.line(30, HEIGHT - 20, WIDTH - 30, HEIGHT - 20)
    # Header
    canvas_obj.setFont('Helvetica-Bold', 8)
    canvas_obj.setFillColor(PRIMARY)
    canvas_obj.drawString(30, HEIGHT - 16, "MENGLISH")
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(GRAY)
    canvas_obj.drawRightString(WIDTH - 30, HEIGHT - 16, "Tai lieu Mo ta Chuc nang")
    # Footer
    canvas_obj.setStrokeColor(BORDER)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(30, 30, WIDTH - 30, 30)
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(GRAY)
    canvas_obj.drawCentredString(WIDTH/2, 16, f"Trang {doc.page}")
    canvas_obj.restoreState()

# ── Build Document ──
def build_pdf():
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "MENGLISH_Product_Documentation.pdf")

    doc = BaseDocTemplate(output_path, pagesize=A4,
                          leftMargin=30, rightMargin=30,
                          topMargin=35, bottomMargin=40)

    cover_frame = Frame(30, 40, WIDTH - 60, HEIGHT - 80, id='cover')
    normal_frame = Frame(30, 45, WIDTH - 60, HEIGHT - 85, id='normal')

    doc.addPageTemplates([
        PageTemplate(id='cover', frames=cover_frame, onPage=cover_page),
        PageTemplate(id='normal', frames=normal_frame, onPage=normal_page),
    ])

    story = []

    # ════════════════════════════════════════════
    # COVER PAGE
    # ════════════════════════════════════════════
    story.append(Spacer(1, 60))

    story.append(colored_box(
        '<b>MENGLISH PLATFORM</b>',
        PRIMARY, WHITE
    ))
    story.append(Spacer(1, 20))
    story.append(Paragraph("MENGLISH", ST['title']))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "He thong Quan ly Trung tam Tieng Anh Toan dien",
        ParagraphStyle('bigtitle', fontName='Helvetica-Bold', fontSize=18, leading=24, textColor=PRIMARY_DARK)
    ))
    story.append(Spacer(1, 16))
    story.append(Paragraph(
        "Tai lieu mo ta chi tiet chuc nang san pham danh cho Quy Khach hang. "
        "Bao gom toan bo cac tinh nang quan ly hoc vien, giao vien, tai chinh, "
        "bao cao va cong phu huynh.",
        ST['subtitle']
    ))
    story.append(Spacer(1, 30))

    # Info table on cover
    info_data = [
        ["San pham:", "MENGLISH \xe2\x80\x94 English Center Management System"],
        ["Phien ban:", "1.0 (03/2026)"],
        ["Doi tuong:", "Trung tam ngoai ngu, trung tam tieng Anh"],
        ["Tai lieu:", "Mo ta chuc nang (danh cho khach hang)"],
    ]
    info_table = Table(info_data, colWidths=[100, WIDTH - 160])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), GRAY),
        ('TEXTCOLOR', (1, 0), (1, -1), TEXT),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(info_table)

    # ════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ════════════════════════════════════════════
    story.append(PageBreak())
    # Switch template
    from reportlab.platypus import NextPageTemplate
    story.insert(-1, NextPageTemplate('normal'))

    story.append(Paragraph("MUC LUC", ST['h1']))
    story.append(Spacer(1, 10))

    toc_items = [
        ("1.", "Tong quan He thong"),
        ("2.", "Cac vai tro nguoi dung (Roles)"),
        ("3.", "CRM & Tuyen sinh"),
        ("4.", "Quan ly Khoa hoc"),
        ("5.", "Quan ly Hoc vien"),
        ("6.", "Quan ly Lop hoc"),
        ("7.", "Tai chinh & Hoc phi"),
        ("8.", "Lich day & Thoi khoa bieu"),
        ("9.", "Cham cong Nhan su"),
        ("10.", "Phan cong Cong viec"),
        ("11.", "Quan ly Tai lieu"),
        ("12.", "He thong Bao cao (18 Module)"),
        ("13.", "Cong Phu huynh"),
        ("14.", "Ho tro & Ticket"),
        ("15.", "Cai dat He thong"),
    ]

    for num, title in toc_items:
        row = Table(
            [[Paragraph(f"<b>{num}</b>", ST['toc']), Paragraph(title, ST['toc'])]],
            colWidths=[35, WIDTH - 95]
        )
        row.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 0.3, BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(row)

    # ════════════════════════════════════════════
    # SECTION 1: TONG QUAN
    # ════════════════════════════════════════════
    story.append(PageBreak())
    story.append(section_header(1, "Tong quan He thong"))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "MENGLISH la nen tang quan ly trung tam tieng Anh toan dien, "
        "duoc thiet ke de so hoa toan bo quy trinh van hanh cua mot trung tam ngoai ngu "
        "tu tuyen sinh, quan ly hoc vien, giao vien, tai chinh den bao cao nghiep vu. "
        "He thong giup tiet kiem thoi gian, giam sai sot thu cong va nang cao hieu qua quan ly.",
        ST['body']
    ))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Diem noi bat:</b>", ST['body_bold']))
    highlights = [
        "Quan ly tap trung tren 1 nen tang duy nhat \xe2\x80\x94 khong can nhieu phan mem roi rac",
        "Phan quyen theo vai tro (Quan tri vien, Giao vien, Phu huynh) \xe2\x80\x94 moi nguoi chi thay nhung gi can thiet",
        "Giao dien than thien, de su dung tren ca may tinh va dien thoai",
        "He thong bao cao 18 module chi tiet, ho tro ra quyet dinh nhanh chong",
        "Cong phu huynh rieng biet de theo doi ket qua hoc tap va hoc phi cua con",
        "CRM tuyen sinh tich hop, theo doi lead tu luc tiep can den khi chot",
        "Cap nhat du lieu thoi gian thuc (Live Update)",
    ]
    for h in highlights:
        story.append(Paragraph(f"\xe2\x9c\x93  {h}", ST['bullet']))

    story.append(Spacer(1, 16))

    # Overview stats
    stats_data = [
        [Paragraph("<b>24+</b>", ParagraphStyle('stat_num', fontName='Helvetica-Bold', fontSize=20, textColor=PRIMARY, alignment=TA_CENTER)),
         Paragraph("<b>18</b>", ParagraphStyle('stat_num', fontName='Helvetica-Bold', fontSize=20, textColor=ACCENT, alignment=TA_CENTER)),
         Paragraph("<b>3</b>", ParagraphStyle('stat_num', fontName='Helvetica-Bold', fontSize=20, textColor=WARN, alignment=TA_CENTER))],
        [Paragraph("Tinh nang chinh", ParagraphStyle('stat_label', fontName='Helvetica', fontSize=9, textColor=GRAY, alignment=TA_CENTER)),
         Paragraph("Module bao cao", ParagraphStyle('stat_label', fontName='Helvetica', fontSize=9, textColor=GRAY, alignment=TA_CENTER)),
         Paragraph("Vai tro nguoi dung", ParagraphStyle('stat_label', fontName='Helvetica', fontSize=9, textColor=GRAY, alignment=TA_CENTER))],
    ]
    stats_table = Table(stats_data, colWidths=[(WIDTH-60)/3]*3)
    stats_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, 0), 16),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 16),
        ('BACKGROUND', (0, 0), (-1, -1), GRAY_LIGHT),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
    ]))
    story.append(stats_table)

    # ════════════════════════════════════════════
    # SECTION 2: ROLES
    # ════════════════════════════════════════════
    story.append(PageBreak())
    story.append(section_header(2, "Cac vai tro nguoi dung"))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "MENGLISH phan quyen theo 3 vai tro chinh. Moi vai tro co giao dien va quyen han rieng, "
        "dam bao nguoi dung chi truy cap nhung chuc nang phu hop voi nhiem vu cua minh.",
        ST['body']
    ))
    story.append(Spacer(1, 12))

    # ADMIN ROLE
    story.append(colored_box('<b>QUAN TRI VIEN (Admin)</b> \xe2\x80\x94 Quyen truy cap toan bo he thong', PRIMARY, WHITE))
    story.append(Spacer(1, 8))
    admin_features = [
        "Truy cap toan bo 24+ chuc nang cua he thong",
        "Quan ly CRM tuyen sinh: tao, theo doi, chuyen doi lead",
        "Quan ly khoa hoc, lop hoc, giao vien, hoc vien",
        "Quan ly tai chinh: hoc phi, thu chi, ke toan",
        "Xem va xuat 18 module bao cao nghiep vu",
        "Phan cong cong viec cho giao vien va nhan vien",
        "Quan ly tai lieu va phan quyen truy cap",
        "Cham cong nhan su va tinh luong",
        "Cai dat he thong va phan quyen nguoi dung",
    ]
    for f in admin_features:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 14))

    # TEACHER ROLE
    story.append(colored_box('<b>GIAO VIEN (Teacher)</b> \xe2\x80\x94 Quan ly lop hoc va cong viec duoc phan cong', ACCENT, WHITE))
    story.append(Spacer(1, 8))
    teacher_features = [
        "Xem danh sach lop hoc duoc phan cong day",
        "Diem danh hoc vien trong lop",
        "Xem lich day ca nhan",
        "Cham cong bang GPS (check-in/check-out)",
        "Xem va cap nhat cong viec duoc phan cong",
        "Truy cap tai lieu giang day",
        "Tham gia CRM tuyen sinh",
        "Gui va nhan ticket ho tro",
    ]
    for f in teacher_features:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 14))

    # PARENT ROLE
    story.append(colored_box('<b>PHU HUYNH (Parent)</b> \xe2\x80\x94 Theo doi hoc tap va hoc phi cua con', HexColor("#8B5CF6"), WHITE))
    story.append(Spacer(1, 8))
    parent_features = [
        "Xem thong tin hoc vien (con em) va lop hoc dang theo hoc",
        "Theo doi ket qua hoc tap, diem so, xep loai",
        "Xem lich su diem danh va chuyen can",
        "Kiem tra tinh trang hoc phi va lich su thanh toan",
        "Doc tin tuc, su kien cua trung tam",
        "Lien he truc tiep voi giao vien",
        "Nop bai tap cho con",
    ]
    for f in parent_features:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 3: CRM
    # ════════════════════════════════════════════
    story.append(PageBreak())
    story.append(section_header(3, "CRM & Tuyen sinh"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Quan tri vien, Giao vien", ST['tag']))
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "Module CRM giup trung tam quan ly toan bo quy trinh tuyen sinh tu khi tiep nhan "
        "thong tin khach hang tiem nang (lead) den khi hoc vien dang ky thanh cong.",
        ST['body']
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Giao dien Kanban 4 giai doan:</b>", ST['body_bold']))
    crm_stages = [
        "<b>Moi</b> \xe2\x80\x94 Lead vua tiep nhan, chua xu ly",
        "<b>Dang cham</b> \xe2\x80\x94 Dang tu van, cham soc khach hang",
        "<b>Cho test</b> \xe2\x80\x94 Khach da hen ngay thi xep lop",
        "<b>Da chot</b> \xe2\x80\x94 Khach da dang ky thanh cong",
    ]
    for s in crm_stages:
        story.append(Paragraph(f"\xe2\x80\xa2  {s}", ST['bullet']))

    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Tinh nang chinh:</b>", ST['body_bold']))
    crm_features = [
        "Tao lead moi voi thong tin: ho ten, so dien thoai, khoa hoc quan tam",
        "Keo tha (drag & drop) de chuyen lead giua cac giai doan",
        "Hien thi gia tri uoc tinh cua moi lead (VND)",
        "Gan lead cho nhan vien phu trach",
        "Giao dien toi uu cho ca may tinh va dien thoai",
    ]
    for f in crm_features:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 4: COURSES
    # ════════════════════════════════════════════
    story.append(Spacer(1, 20))
    story.append(section_header(4, "Quan ly Khoa hoc"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Quan tri vien", ST['tag']))
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "Quan ly toan bo chuong trinh dao tao cua trung tam theo cau truc phan cap 3 tang: "
        "Danh muc khoa hoc > Cap do > Lop hoc cu the.",
        ST['body']
    ))
    story.append(Spacer(1, 10))

    course_features = [
        "Tao va quan ly danh muc khoa hoc (VD: IELTS, TOEIC, Tieng Anh tre em, Giao tiep...)",
        "Thiet lap cap do cho moi khoa (VD: Basic, Intermediate, Advanced)",
        "Dinh nghia thoi luong va hoc phi cho tung cap do",
        "Xem so luong hoc vien va lop hoc theo tung danh muc",
        "Giao dien mo/dong (collapse/expand) de quan ly don gian",
    ]
    for f in course_features:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 5: STUDENTS
    # ════════════════════════════════════════════
    story.append(PageBreak())
    story.append(section_header(5, "Quan ly Hoc vien"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Quan tri vien", ST['tag']))
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "Trung tam quan ly toan dien thong tin hoc vien tu dang ky, hoc tap, "
        "diem danh, hoc phi den hoc bu. Giao dien 3 tab chinh giup truy cap nhanh.",
        ST['body']
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Tab 1: Danh sach Hoc vien</b>", ST['h3']))
    stu_list = [
        "Bang danh sach hoc vien voi: ten, cap do, lop hoc, trang thai, hoc phi",
        "Tim kiem hoc vien theo ten hoac ma so",
        "Loc theo trang thai: Dang hoc / Tam nghi / Tot nghiep",
        "Them hoc vien moi",
        "Click vao hoc vien de xem ho so chi tiet",
    ]
    for f in stu_list:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Tab 2: Diem danh</b>", ST['h3']))
    stu_att = [
        "Bang ma tran diem danh: Hoc vien x Buoi hoc",
        "Danh dau trang thai: Co mat / Di muon / Vang",
        "Tim kiem va loc theo lop hoc",
        "Phan trang khi co nhieu hoc vien",
    ]
    for f in stu_att:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Tab 3: Hoc bu</b>", ST['h3']))
    stu_makeup = [
        "Quy trinh 3 buoc: Cho duyet > Da duyet > Hoan thanh",
        "Tao yeu cau hoc bu voi thong tin: hoc vien, buoi vang, lop bu",
        "Duyet va cap nhat trang thai yeu cau",
        "Loc yeu cau theo trang thai",
    ]
    for f in stu_makeup:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 12))
    story.append(Paragraph("<b>Ho so chi tiet Hoc vien (khi click vao ten):</b>", ST['h3']))
    stu_detail = [
        "Thong tin ca nhan: ten, ma so, email, so dien thoai, trang thai",
        "Lich su lop hoc: cac lop da va dang tham gia",
        "Nhat ky diem danh: chi tiet tung buoi hoc",
        "Ket qua thi: diem 4 ky nang (Nghe, Noi, Doc, Viet) va xep loai",
        "Hoc phi: lich su thanh toan, so tien con no, nut nhac hoc phi",
        "Ghi chu noi bo cua giao vien/nhan vien",
    ]
    for f in stu_detail:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 6: CLASSES
    # ════════════════════════════════════════════
    story.append(PageBreak())
    story.append(section_header(6, "Quan ly Lop hoc"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Quan tri vien (toan bo) | Giao vien (lop duoc phan cong)", ST['tag']))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Danh sach Lop hoc (Admin):</b>", ST['h3']))
    class_list = [
        "Xem tat ca lop hoc voi: ten lop, lich hoc, giao vien, so hoc vien, trang thai",
        "Click vao lop de xem chi tiet",
    ]
    for f in class_list:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Lop hoc cua toi (Giao vien):</b>", ST['h3']))
    my_classes = [
        "Luoi the (card) hien thi cac lop dang day",
        "Moi the hien thi: ten lop, lich hoc, phong, so hoc vien",
        "Hien thi avatar hoc vien trong lop",
        "Chuyen doi giao dien luoi/danh sach",
    ]
    for f in my_classes:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Chi tiet Lop hoc:</b>", ST['h3']))
    class_detail = [
        "Tong quan lop: thong tin chung, giao vien, lich hoc, so luong hoc vien",
        "Danh sach buoi hoc: tieu de bai, bai tap, ngay hoc",
        "Diem danh theo buoi: danh dau Co mat / Di muon / Vang cho tung hoc vien",
        "Tai lieu lop hoc: upload va quan ly file giang day",
        "Phu huynh co the nop bai tap cho con qua giao dien nay",
    ]
    for f in class_detail:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 7: FINANCE
    # ════════════════════════════════════════════
    story.append(Spacer(1, 20))
    story.append(section_header(7, "Tai chinh & Hoc phi"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Quan tri vien", ST['tag']))
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "Quan ly tai chinh toan dien voi 2 phan chinh: Quan ly hoc phi va Ke toan thu chi.",
        ST['body']
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Quan ly Hoc phi:</b>", ST['h3']))
    fin_tuition = [
        "Bang tong hop KPI: tong da thu, dang cho, qua han",
        "Bang danh sach hoc phi theo hoc vien, co the loc theo chi nhanh, lop, trang thai",
        "Trang thai thanh toan: Da dong / Chua dong / Qua han",
        "Xuat bao cao hoc phi",
    ]
    for f in fin_tuition:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Ke toan & Thu chi:</b>", ST['h3']))
    fin_acc = [
        "Tong hop doanh thu, chi phi va loi nhuan rong",
        "Bang ke thu (phieu thu) va chi (phieu chi)",
        "Tao phieu thu/chi moi",
        "Loc giao dich theo loai, thoi gian",
    ]
    for f in fin_acc:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 8: SCHEDULE
    # ════════════════════════════════════════════
    story.append(PageBreak())
    story.append(section_header(8, "Lich day & Thoi khoa bieu"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Quan tri vien (quan ly) | Giao vien (xem lich ca nhan)", ST['tag']))
    story.append(Spacer(1, 8))

    schedule_features = [
        "Bang thoi khoa bieu lon: Lop hoc x Ngay trong tuan x Ca day (Sang/Chieu/Toi)",
        "Hien thi ten giao vien va phong hoc trong moi o",
        "Loc lich theo giao vien, lop hoc, thang, nam",
        "Chuyen doi giao dien: Chi tiet / Tong quan",
        "Them lich day moi (Admin)",
        "Nhan dien xung dot lich (canh bao truc quan)",
        "Xem trang thai phong trong/ban",
    ]
    for f in schedule_features:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 9: TIMEKEEPING
    # ════════════════════════════════════════════
    story.append(Spacer(1, 20))
    story.append(section_header(9, "Cham cong Nhan su"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Quan tri vien (quan ly) | Giao vien (cham cong ca nhan)", ST['tag']))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Giao dien Quan tri vien:</b>", ST['h3']))
    tk_admin = [
        "Bang KPI thoi gian thuc: tong buoi day hom nay, da cham cong, di muon, vang",
        "Bang cham cong toan bo nhan vien: gio vao, gio ra, thoi luong",
        "Click vao giao vien de xem bao cao thang",
        "Bao cao thang chi tiet: ngay, gio vao/ra, thoi luong, vi tri GPS, trang thai, ghi chu",
        "Xuat bao cao Excel",
    ]
    for f in tk_admin:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Giao dien Giao vien:</b>", ST['h3']))
    tk_teacher = [
        "Dong ho so thoi gian thuc hien thi tren man hinh",
        "Nut Cham cong vao / Cham cong ra voi xac minh GPS",
        "Bao cao cham cong ca nhan theo thang",
        "Theo doi tong gio lam va so phut di muon",
    ]
    for f in tk_teacher:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 10: TASKS
    # ════════════════════════════════════════════
    story.append(Spacer(1, 20))
    story.append(section_header(10, "Phan cong Cong viec"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Quan tri vien (tao & quan ly) | Giao vien (xem cong viec duoc giao)", ST['tag']))
    story.append(Spacer(1, 8))

    task_features = [
        "Bang Kanban 3 cot: Can lam / Dang lam / Hoan thanh",
        "Moi the cong viec hien thi: tieu de, do uu tien, nguoi phu trach, han chot",
        "Do uu tien: Thap (xanh) / Trung binh (vang) / Cao (do)",
        "Admin tao cong viec va gan cho nhan vien",
        "Keo tha de cap nhat trang thai cong viec",
        "Tim kiem cong viec theo tieu de",
        "Giao vien chi thay cong viec duoc phan cong cho minh",
    ]
    for f in task_features:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 11: DOCUMENTS
    # ════════════════════════════════════════════
    story.append(PageBreak())
    story.append(section_header(11, "Quan ly Tai lieu"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Quan tri vien (toan quyen) | Giao vien (xem tai lieu duoc phan quyen)", ST['tag']))
    story.append(Spacer(1, 8))

    doc_features = [
        "Bang tai lieu voi: ten file, loai (PDF/Word/Excel/PPT), ngay upload, kich thuoc, lop hoc",
        "Bieu tuong mau theo loai file: PDF do, Word xanh duong, Excel xanh la, PPT cam",
        "Upload tai lieu moi (Admin)",
        "Phan quyen tai lieu: tat ca lop hoac chi lop cu the",
        "Kiem soat quyen truy cap giao vien theo tung tai lieu",
        "Tai tai lieu ve",
        "Xoa tai lieu (Admin)",
        "Thong ke dung luong luu tru",
    ]
    for f in doc_features:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 12: REPORTS
    # ════════════════════════════════════════════
    story.append(Spacer(1, 20))
    story.append(section_header(12, "He thong Bao cao (18 Module)"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Quan tri vien", ST['tag']))
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "He thong bao cao toan dien voi 18 module nghiep vu, bao phu moi khia canh "
        "van hanh cua trung tam. Moi module co giao dien rieng voi bieu do, bang so lieu "
        "va kha nang xuat Excel.",
        ST['body']
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Tong quan giao dien:</b>", ST['body_bold']))
    report_overview = [
        "Trang tong hop hien thi 18 module dang luoi the (card grid)",
        "Moi module co bieu tuong rieng va ten ro rang",
        "Click vao module de xem bao cao chi tiet",
        "Toan bo bao cao co nut Loc du lieu va Xuat Excel",
        "Du lieu hien thi kem nhan \"Live Update\" (cap nhat thoi gian thuc)",
    ]
    for f in report_overview:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 12))

    # Report groups
    story.append(Paragraph("<b>Nhom 1: Hoc vien & Lop hoc</b>", ST['h3']))
    report_g1 = [
        ["Bieu do hoc vien", "4 the KPI (tong/dang hoc/bao luu/tot nghiep), bieu do tang truong 6 thang, bieu do tron phan bo trinh do"],
        ["Bao cao chuyen lop", "Luoi the theo lop hoc, hien thi trang thai chuyen lop va tien do"],
        ["Bao cao hoc thu", "Luoi the theo lop, thong tin buoi hoc thu va ket qua"],
        ["Bao cao tong lop", "Tong quan toan bo lop hoc, ti le lap day, trang thai"],
        ["Lop, hoc vien", "Danh sach lop voi so hoc vien, click xem chi tiet bang diem"],
        ["Hoc vien trong ngay", "Danh sach lop co buoi hoc trong ngay voi ti le chuyen can"],
    ]
    for name, desc in report_g1:
        story.append(Paragraph(f"\xe2\x80\xa2  <b>{name}:</b> {desc}", ST['bullet']))

    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Nhom 2: Diem danh & Ket qua hoc tap</b>", ST['h3']))
    report_g2 = [
        ["Bao cao diem danh", "Danh sach lop voi ti le chuyen can. Click vao lop de xem bang diem chi tiet 4 ky nang (Nghe/Noi/Doc/Viet) voi diem trung binh va xep loai (Xuat sac/Gioi/Kha)"],
        ["Ket qua hoc tap", "Tuong tu bao cao diem danh, hien thi diem trung binh lop va chi tiet tung hoc vien"],
    ]
    for name, desc in report_g2:
        story.append(Paragraph(f"\xe2\x80\xa2  <b>{name}:</b> {desc}", ST['bullet']))

    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Nhom 3: Tai chinh</b>", ST['h3']))
    report_g3 = [
        ["Bao cao am hoc phi", "Thong ke chung (tong ca/da xu ly/dang cho), the canh bao tong gia tri ton dong, danh sach chi tiet no"],
        ["Phan bo hoc phi thang", "Thong ke phan bo hoc phi theo thang voi trang thai xu ly"],
        ["Nhac han hoc phi", "Bang danh sach hoc vien can nhac, trang thai CHUA GUI, nut GUI NGAY"],
        ["No hoc phi", "Tong gia tri ton dong, danh sach hoc vien no voi so tien va so ngay qua han"],
        ["No dat coc", "Tuong tu no hoc phi, theo doi tien dat coc"],
        ["Loi nhuan", "The tong quan loi nhuan rong (so tien lon, % thay doi so voi thang truoc, diem hoa von). Bieu do co cau doanh thu (hoc phi/giao trinh/thi cu) va chi phi (luong/mat bang/marketing)"],
    ]
    for name, desc in report_g3:
        story.append(Paragraph(f"\xe2\x80\xa2  <b>{name}:</b> {desc}", ST['bullet']))

    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Nhom 4: Nhan su & Van hanh</b>", ST['h3']))
    report_g4 = [
        ["Tin chua gui duoc", "Bang danh sach tin nhan that bai voi trang thai LOI GUI va nut GUI LAI"],
        ["Bang cham cong", "Bang nhan vien voi: so gio lam, so lan di muon, tinh trang"],
        ["Luong", "Bang nhan vien voi: luong co ban, thuong/phu cap, thuc nhan"],
        ["Bao cao phong", "Luoi the phong hoc voi so gio su dung/ngay va tinh trang"],
    ]
    for name, desc in report_g4:
        story.append(Paragraph(f"\xe2\x80\xa2  <b>{name}:</b> {desc}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 13: PARENT PORTAL
    # ════════════════════════════════════════════
    story.append(PageBreak())
    story.append(section_header(13, "Cong Phu huynh"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Phu huynh", ST['tag']))
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "Giao dien rieng danh cho phu huynh de theo doi qua trinh hoc tap cua con em. "
        "Giao dien don gian, de su dung voi 5 tab chinh:",
        ST['body']
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Tab 1: Thong tin Hoc vien</b>", ST['h3']))
    parent_t1 = [
        "Ho so cua con: ten, lop dang hoc, giao vien chu nhiem",
        "Ngay nhap hoc, tinh trang hoc phi",
        "Thong tin lien he giao vien",
    ]
    for f in parent_t1:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Tab 2: Lop hoc & Ket qua</b>", ST['h3']))
    parent_t2 = [
        "Xem chi tiet lop hoc ma con dang theo hoc",
        "Diem so va ket qua hoc tap",
        "Lich su diem danh cua con",
        "Nop bai tap cho con",
    ]
    for f in parent_t2:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Tab 3: Hoc phi & Lich su thanh toan</b>", ST['h3']))
    parent_t3 = [
        "Xem cac khoan hoc phi cua con",
        "Lich su thanh toan voi trang thai: Da dong / Chua dong / Qua han",
        "Tong so tien con no (neu co)",
    ]
    for f in parent_t3:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Tab 4: Tin tuc & Su kien</b>", ST['h3']))
    parent_t4 = [
        "Cac thong bao moi nhat tu trung tam",
        "Su kien sap dien ra voi ngay, noi dung",
    ]
    for f in parent_t4:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Tab 5: Lien he Trung tam</b>", ST['h3']))
    parent_t5 = [
        "Chat truc tiep voi giao vien cua con",
        "Thong tin lien he trung tam: dia chi, dien thoai, email",
    ]
    for f in parent_t5:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 14: TICKETS
    # ════════════════════════════════════════════
    story.append(Spacer(1, 20))
    story.append(section_header(14, "Ho tro & Ticket"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Tat ca", ST['tag']))
    story.append(Spacer(1, 8))

    ticket_features = [
        "He thong ticket ho tro noi bo voi 3 trang thai: Moi tao / Dang xu ly / Da dong",
        "Giao dien Kanban de quan ly va theo doi ticket",
        "Moi ticket hien thi: tieu de, do uu tien, nguoi gui, danh muc, ngay tao",
        "Tao ticket moi de yeu cau ho tro",
        "Keo tha de cap nhat trang thai",
    ]
    for f in ticket_features:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # SECTION 15: SETTINGS
    # ════════════════════════════════════════════
    story.append(Spacer(1, 20))
    story.append(section_header(15, "Cai dat He thong"))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Vai tro: Quan tri vien", ST['tag']))
    story.append(Spacer(1, 8))

    settings_features = [
        "<b>Thong tin trung tam:</b> Ten, dia chi, logo, thong tin lien he",
        "<b>Phan quyen:</b> Thiet lap vai tro va quyen truy cap cho tung nhom nguoi dung",
        "<b>Cau hinh chung:</b> Mui gio, ngon ngu, don vi tien te",
        "<b>Thong bao:</b> Cau hinh kenh thong bao (Email, SMS, canh bao he thong)",
    ]
    for f in settings_features:
        story.append(Paragraph(f"\xe2\x80\xa2  {f}", ST['bullet']))

    # ════════════════════════════════════════════
    # CLOSING PAGE
    # ════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Spacer(1, 40))

    story.append(colored_box(
        '<b>MENGLISH</b> \xe2\x80\x94 He thong Quan ly Trung tam Tieng Anh Toan dien',
        PRIMARY, WHITE
    ))
    story.append(Spacer(1, 20))

    story.append(Paragraph(
        "Cam on Quy Khach hang da danh thoi gian tim hieu ve MENGLISH. "
        "Chung toi tin rang nen tang nay se giup trung tam cua ban van hanh "
        "hieu qua hon, tiet kiem chi phi va nang cao chat luong dich vu.",
        ST['body']
    ))
    story.append(Spacer(1, 16))

    story.append(Paragraph("<b>Tong ket tinh nang:</b>", ST['body_bold']))
    summary = [
        "24+ chuc nang chinh bao phu toan bo nghiep vu trung tam",
        "18 module bao cao phan tich chi tiet",
        "3 vai tro nguoi dung voi phan quyen ro rang",
        "Giao dien hien dai, tuong thich may tinh va dien thoai",
        "Du lieu cap nhat thoi gian thuc",
        "Ho tro xuat bao cao Excel",
    ]
    for s in summary:
        story.append(Paragraph(f"\xe2\x9c\x93  {s}", ST['bullet']))

    story.append(Spacer(1, 30))
    story.append(divider())
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Tai lieu nay duoc tao tu dong boi he thong MENGLISH. "
        "Moi thong tin chi tiet xin vui long lien he doi ngu ho tro.",
        ST['caption']
    ))

    # Build
    doc.build(story)
    print(f"PDF created: {output_path}")
    return output_path

if __name__ == "__main__":
    build_pdf()
