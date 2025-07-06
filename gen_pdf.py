import qrcode.constants
from reportlab.lib.pagesizes import portrait, A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.utils import ImageReader
import qrcode


def generate_qr_code(qr_data: str, filename: str):
    print("gen qr with: " + qr_data)
    qrcode.make(
        qr_data, border=1, error_correction=qrcode.constants.ERROR_CORRECT_H
    ).save(filename)


def create_pdf(
    data: str,
    filename: str,
    qr_data: str,
    l_path: str,
):
    pdfmetrics.registerFont(TTFont("Black", "fonts/Roboto-Black.ttf"))
    pdfmetrics.registerFont(TTFont("Bold", "fonts/Roboto-Bold.ttf"))
    # pdfmetrics.registerFont(TTFont("ExtraBold", "fonts/Roboto-ExtraBold.ttf"))
    # pdfmetrics.registerFont(TTFont("Medium", "fonts/Roboto-Medium.ttf"))
    pdfmetrics.registerFont(TTFont("Regular", "fonts/Roboto-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("SemiBold", "fonts/Roboto-SemiBold.ttf"))

    qr_file = f"out/qr/{data}.png"
    generate_qr_code(qr_data, qr_file)

    c = canvas.Canvas(filename, pagesize=portrait(A4))
    width, height = portrait(A4)

    # Centering helper
    def text(text: str, x_offset: int, y: int, font: str, size: int):
        c.setFont(font, size)
        c.drawString(
            ((width - c.stringWidth(text, font, size)) / 2) + x_offset, y, text
        )

    ####################
    ## RENDERING CODE ##
    ####################

    # Draw question ID
    text(data.split("_")[0], 0, height - 200, "Black", 100)

    text("RoboCamp 2025", 0, 45, "Black", 30)

    # Logo
    l_s = 100
    c.drawImage(ImageReader(l_path), width-l_s-10 ,10, l_s, l_s)

    # Draw QR code centered
    qr_s = 400  # Size of QR code
    c.drawImage(ImageReader(qr_file), (width - qr_s) / 2, 100, qr_s, qr_s)


    c.showPage()
    c.save()


def gen_pdf(id: str, text: str):
    create_pdf(text, f"out/pdf/{id}.pdf", f"{id}", "logo.png")


if __name__ == "__main__":
    gen_pdf(1)
