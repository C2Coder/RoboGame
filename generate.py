#!./.venv/bin/python

### Imports ###
from gen_flow import gen_flow
from gen_pdf import gen_pdf
from PyPDF2 import PdfMerger
import os, shutil, json, random
### Variables ###

pattern = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5]

num_questions = sum(pattern)
q_shuf = []
id_to_ql = []
for l in range(len(pattern)):
    for q in range(pattern[l]):
        id_to_ql.append([q, l])


### Functions ###

def merge_pdfs(pdf_list:list[str], output_filename:str)-> None:
    merger = PdfMerger()
    for pdf in pdf_list:
        merger.append(pdf)
    merger.write(output_filename)
    merger.close()

def get_id(pos: list | tuple | None) -> int | None:
    return None if pos == None else int(sum(pattern[:pos[0]])+pos[1])

def shuf(id: int | None):
    return None if id == None else q_shuf[id]+1

def gen_question_file(qlist:list, flow, plist:list, rng:random.Random) -> list:
    if len(plist) < len(qlist):
        print("ERROR: Less positions than questions")
        os._exit()
    out = []

    first_layer_pos = [103, 104, 105, 106, 107]

    last_layer_pos = [5, 6, 7, 8, 9]

    available_pos = [i for i in range(1, len(plist)+1) if i not in first_layer_pos and i not in last_layer_pos]

    last_layer = [{"id": int(i+len(qlist)+1), "posId":p, "lat":plist[p-1]["lat"], "lng":plist[p-1]["lng"], "color":plist[p-1]["color"], "c":"a", "tA":None, "tB":None, "tC":None, "tD":None} for i, p in enumerate(last_layer_pos)]

    for i, q in enumerate(qlist):
        ql = id_to_ql[i]
        f = flow[ql[1]][ql[0]]

        if ql[1] == 0:
            pos_id = first_layer_pos.pop(0)
        else:
            pos_id = rng.choice(available_pos)
            available_pos.remove(pos_id)

        tmp = {"id":str(i+1), "posId":pos_id, "layer":ql[1], "layerId":ql[0]}

        if f"t{str(q['c']).upper()}" not in q.keys():
            q[f"t{str(q['c']).upper()}"] = rng.choice(last_layer)["id"]

        tmp.update(plist[pos_id-1])
        tmp.update(q)
        out.append(tmp)
    out.extend(last_layer)

    return out
    

def print_q_map(q_map:list[list[int]]):
    print("")
    for i, l in enumerate(q_map):
        out = ""
        for q in l:
            out = out + f"{q}".ljust(4)
        
        out = f"{i}:".ljust(4) + out.center(len(q_map[0])*4)
        print(out)

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

def main(seed, positions, questions) -> list[float, float, float]:
    global q_shuf
    rng = random.Random(seed)
    q_shuf = list(range(sum(pattern)))
    rng.shuffle(q_shuf)

    flow = gen_flow(pattern, rng)

    questions = questions[:num_questions]

    for i, q in enumerate(questions):
        q["id"] = shuf(int(i))

    question_map = [[None for _ in range(pattern[i])] for i in range(len(pattern))]

    for layer in range(len(pattern)):
        for id in range(pattern[layer]):
            g: dict = flow[layer][id]
            q: dict = questions[get_id((layer, id))]

            op = ["A", "B", "C", "D"]
            op.remove(q["c"])

            if g["correct"] is None:
                pass
            else:
                q[f"t{q['c']}"] = shuf(get_id(g["correct"])) 

            w = list(g["wrong"])
            rng.shuffle(w)

            for i, o in enumerate(op):
                q[f"t{o}"] = shuf(get_id(w[i]))

            question_map[layer][id] = q.get("id")

    with open("out/question-map.json", "w") as f:
        json.dump(question_map, f, indent=2)

    game_data = gen_question_file(questions, flow, positions, rng)

    with open("out/questions.json", "w") as f:
        json.dump(game_data, f, indent=2)
    print(game_data)
    clean()
    
    print(f"\nGenerating {len(questions)} PDFs")
    for i, q in enumerate(questions):
        print(f"id:{str(q['id']).ljust(len(str(len(questions)))+1)}  {str(i).rjust(len(str(len(questions))))}/{len(questions)}")
        gen_pdf(f"q{int(q['id'])}")
    
    gen_pdf("check")

    print("\nMerging PDFs together")
    pdfs = [f"out/pdf/q{i+1}.pdf" for i in range(num_questions)]
    pdfs.append("out/pdf/check.pdf")
    merge_pdfs(pdfs, "out/pdf/all.pdf")
    
    print("\nPDF generation Done!")



if __name__ == "__main__":
    with open("questions.json", "r") as f:
        _questions = json.load(f)
    
    with open("positions.json", "r") as f:
        _positions = json.load(f)
        

    main(seed=317241, positions=_positions, questions=_questions)