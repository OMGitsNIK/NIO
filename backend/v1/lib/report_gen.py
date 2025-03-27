
from weasyprint import HTML
import io
import base64
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import matplotlib.colors as mcolors
from icecream import ic



def generate_pdf_report(step_paths):
    def generate_chart():
        detections = ["Osculum", "Tentacles", "Fish", ]
        counts = [4, 5, 0]

        d3_colormap = cm.get_cmap("tab10")
        colors = [mcolors.to_hex(d3_colormap(i)) for i in range(len(detections))]

        plt.figure(figsize=(6, 4))
        plt.bar(detections, counts, color=colors)
        plt.title("Object Detection Counts", fontsize=14, weight="bold")
        plt.ylabel("Count", fontsize=12)
        plt.xlabel("Objects", fontsize=12)
        plt.tight_layout()

        buffer = io.BytesIO()
        plt.savefig(buffer, format="png")
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode("utf-8")
        buffer.close()
        plt.close()
        return f"data:image/png;base64,{image_base64}"

    chart_base64 = generate_chart()

    image_rows = ""
    ic(step_paths)
    for i, (label, path) in enumerate(step_paths):
        ic(label)
        with open(path, "rb") as image_file:
            ic(image_file)
            image_base64 = base64.b64encode(image_file.read()).decode("utf-8")
            ic(image_base64[:12])
        image_rows += f"""
        <tr>
            <td>{label}</td>
            <td><img src="data:image/jpeg;base64,{image_base64}" alt="{label}"></td>
        </tr>
        """
    ic(image_rows)
    html_content = f"""
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {{ font-family: 'Roboto', sans-serif; }}
          h1 {{ color: #2a5d8f; }}
          table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
          th, td {{ padding: 10px; border: 1px solid #ddd; }}
          th {{ background-color: #f2f2f2; text-align: left; }}
          img {{ max-width: 200px; max-height: 200px; object-fit: contain; }}
        </style>
      </head>
      <body>
        <h1>Research Report: Sponges</h1>
        <p>This report presents detailed findings on the role of sponges in aquatic ecosystems. The research focuses on sponge biodiversity, their ecological functions, and contributions to marine health.</p>

        <h2>Object Detection Results</h2>
        <p>The chart below shows the frequency of detected objects in analyzed images:</p>
        <img style='max-width:550px;max-height:500px' src="{chart_base64}" alt="Object Detection Chart" />

        <h2>Image Analysis</h2>
        <p>The following table contains sample images analyzed during the study:</p>

        <table>
          <thead>
            <tr>
              <th>Label</th>
              <th>Image</th>

            </tr>
          </thead>

          <tbody>
            {image_rows}

        </tbody>


        </table>

      </body>
    </html>
    """
    ic(html_content[:12])

    HTML(string=html_content).write_pdf("output.pdf")
    with open("output.pdf", "rb") as pdf_file:
        pdf_bytes = pdf_file.read()
        return base64.b64encode(pdf_bytes).decode()
