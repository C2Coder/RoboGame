#!./.venv/bin/python

### Imports ###
from gen_pdf import gen_pdf
from PyPDF2 import PdfMerger
import os, shutil, json, random

### Functions ###


def merge_pdfs(pdf_list: list[str], output_filename: str) -> None:
    merger = PdfMerger()
    for pdf in pdf_list:
        merger.append(pdf)
    merger.write(output_filename)
    merger.close()


def clean():
    if not os.path.exists("out"):
        os.mkdir("out")
    if os.path.exists("out/qr"):
        shutil.rmtree("out/qr")

    if os.path.exists("out/pdf"):
        shutil.rmtree("out/pdf")

    os.mkdir("out/qr")
    os.mkdir("out/pdf")


### Main Code ###


def main():
    clean()
    _total_pdfs = []

    source_pdfs = {
        "wood": 5,
        "copper": 2,
        "silicon": 1,
        "lead": 1,
        "tin": 1,
        "plastic": 1,
        "lithium": 1,
        "steel": 1,
        "ceramic": 1,
    }
    craft_pdfs = [
        "screw",
        "nut",
        "pcb",
        "solder",
        "resistor",
        "ic",
        "led",
        "button",
        "battery",
        "motor",
        "robosvit",
        "cube",
        "smdChallenge",
        "smdCube",
        "simon",
        "slusmetr",
    ]
    transitions = {
        "wood": "Dřevo",
        "copper": "Měď",
        "silicon": "Křemík",
        "lead": "Olovo",
        "tin": "Cín",
        "plastic": "Plast",
        "lithium": "Lithium",
        "steel": "Ocel",
        "ceramic": "Keramika",

        "screw": "Šroub",
        "nut": "Matka",
        "pcb": "Deska",
        "solder": "Pájka",
        "resistor": "Rezistor",
        "ic": "Čip",
        "led": "LED",
        "button": "Tlačítko",
        "battery": "Baterka",
        "motor": "Motor",
        "robosvit": "RoboSvit",
        "cube": "Kostka",
        "smdChallenge": "Smd Výzva",
        "smdCube": "Smd Kostka",
        "simon": "Simon",
        "slusmetr": "Šlusmetr",
    }

    for k in source_pdfs.keys():
        for i in range(source_pdfs[k]):
            _total_pdfs.append(f"{k}_{i+1}")
            gen_pdf(f"{k}_{i+1}", transitions[k])

    for p in craft_pdfs:
        _total_pdfs.append(f"craft_{p}")
        gen_pdf(f"craft_{p}", transitions[p])

    merge_pdfs([f"out/pdf/{p}.pdf" for p in _total_pdfs], "out/pdf/all.pdf")

    print("\nPDF generation Done!")


if __name__ == "__main__":
    main()
