"""Render two reusable Markdown documents without another model call."""
from datetime import datetime, timezone


def clean(value):
    # Avoid active HTML, images or links originating in untrusted report text.
    import html
    import re
    text = html.escape(str(value), quote=False)
    return re.sub(r"([\\`*_{}\[\]()#+!|])", r"\\\1", text)


def bullets(values):
    return "\n".join("- " + clean(value) for value in values) or "- 未提供"


def source(pages):
    return "本次輸入文件 p." + "、".join(map(str, pages)) if pages else "一般性分析，未引用報告頁碼"


def render_reports(data, source_kind, digest):
    context = data["context"]
    title = clean(context["company"] + " " + context["report_period"])
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    origin = "原報告（由使用者標示，未另驗證官方版本）" if source_kind == "original_report" else "二手摘要；未取得原報告，不代表已核對原報告"
    common = f"生成日期（UTC）：{date}\n\n資料來源：{origin}。頁碼僅指本次輸入文件。\n\n來源文件 SHA-256：`{digest}`"
    summary = [f"# {title} 報告重點摘要", common,
               "## 文件範圍與閱讀原則",
               f"發行日期：{clean(context['publication_date'])}\n\n組織邊界：{clean(context['organizational_boundary'])}\n\n確信資訊：{clean(context['assurance_note'])}",
               "本文件為代表性選錄，不代表逐項收錄全部揭露或已獨立確信；不構成 GRI／SASB 合規判定、ESG 評分或同業排名。未計算、未揭露、不適用與待核對分開處理。",
               "## 管理摘要", clean(data["summary"]), "## 指標與政策"]
    index = {item["identifier"]: item for item in data["findings"]}
    for item in data["findings"]:
        summary.extend([
            f"### {clean(item['topic'])} [{clean(item['identifier'])}]",
            f"{clean(item['period'])}；{item['dimension']}；{item['status']}\n\n{clean(item['value'])} {clean(item['unit'])}\n\n{clean(item['fact'])}",
            f"前期：{clean(item['previous_period'])}\n\n目標：{clean(item['target'])}\n\n判讀：{clean(item['interpretation'])}\n\n範圍：{clean(item['scope'])}",
            "原文管理行動：\n\n" + bullets(item["reported_actions"]),
            "限制：\n\n" + bullets(item["limitations"]),
            "來源：" + source(item["source_pages"]) + "\n\n逐字證據：" + clean(item["evidence_quote"]),
        ])
    summary.extend(["## 待核對與可比性", bullets(data["comparability_notes"]),
                    "## 資訊缺口", bullets(data["information_gaps"])])
    suggestions = [f"# {title} 未來永續方針建議", common,
                   "本文件為平台分析建議，不代表企業已公布、採納或核准的承諾、政策、財務預測或量化目標。",
                   "## 管理摘要", clean(data["summary"]), bullets(data["management_directions"]),
                   "## 策略支柱", bullets(list(dict.fromkeys(item["pillar"] for item in data["recommendations"]))) ]
    pillars = list(dict.fromkeys(item["pillar"] for item in data["recommendations"]))
    number = 0
    for pillar in pillars:
        suggestions.append("## " + clean(pillar))
        for item in data["recommendations"]:
            if item["pillar"] != pillar:
                continue
            number += 1
            suggestions.extend([f"### 方針 {number}：{clean(item['action'])}",
                                "性質：平台分析建議；優先順序：" + item["priority"], clean(item["rationale"]), "#### 報告依據"])
            evidence = [index[key] for key in item["evidence_ids"] if key in index]
            suggestions.append(bullets([f"{fact['topic']}：{fact['value']} {fact['unit']}（{fact['period']}；{source(fact['source_pages'])}）" for fact in evidence]) if evidence else "一般性建議，沒有指標層級的報告依據。")
            suggestions.extend(["#### 建議行動", bullets(item["actions"] or [item["action"]]),
                                "#### 建議追蹤指標", bullets(item["tracking_metrics"] or [item["metric"]])])
    suggestions.extend(["## 推進路線圖", "| 階段 | 建議工作 | 預期管理成果 |\n|---|---|---|"])
    for stage in data["roadmap"]:
        suggestions.append(f"| {stage['stage']} | {clean(stage['proposed_work']).replace(chr(10), ' ')} | {clean(stage['expected_management_outcome']).replace(chr(10), ' ')} |")
    suggestions.extend(["## 管理原則", bullets(["可追蹤：保留目標、基準、責任及期限。", "可衡量：投入、產出及最終影響分開。", "可改善：未達標與重大事件有改善及複核機制。", "可查證：保留年度、範圍、方法與來源。"]),
                        "## 使用邊界", "建議追蹤指標是管理方向，不是企業實績或企業已承諾的數值目標。AI 內容仍需人工查核；文件中的其他來源引用未經本系統獨立核驗。"])
    return "\n\n".join(summary) + "\n", "\n\n".join(suggestions) + "\n"
