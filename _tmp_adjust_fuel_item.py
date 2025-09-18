from pathlib import Path

path = Path(r'reactapp/src/pages/homePage.css')
text = path.read_text()

old_block = '''.fuel-item {
    background: rgba(254, 242, 244, 0.1);
    border: 1px solid rgba(239, 35, 60, 0.38);
    border-radius: 22px;
    padding: 20px 18px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: center;
    box-shadow: 0 16px 34px rgba(239, 35, 60, 0.12);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fuel-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(239, 35, 60, 0.22);
}

.fuel-item h3 {
    margin: 0;
    font-size: 1.08rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #ffe4ea;
}

.fuel-price {
    margin: 6px 0 0;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--accent);
}

.fuel-price span {
    margin-left: 6px;
    font-size: 0.9rem;
    color: rgba(255, 228, 234, 0.8);
}

.fuel-updated {
    margin: 0;
    font-size: 0.88rem;
    color: rgba(255, 228, 234, 0.72);
}
'''

new_block = '''.fuel-item {
    position: relative;
    background: rgba(9, 9, 12, 0.92);
    border: 1px solid rgba(120, 124, 133, 0.22);
    border-radius: 22px;
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: center;
    box-shadow: 0 16px 34px rgba(10, 10, 15, 0.32);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fuel-item::before {
    content: "";
    position: absolute;
    left: 18px;
    right: 18px;
    top: 0;
    height: 3px;
    background: linear-gradient(120deg, rgba(239, 35, 60, 0.9), rgba(177, 18, 38, 0.85));
    border-radius: 999px;
}

.fuel-item > * {
    position: relative;
    z-index: 1;
}

.fuel-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 22px 46px rgba(239, 35, 60, 0.18);
}

.fuel-item h3 {
    margin: 0;
    font-size: 1.05rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-primary);
}

.fuel-price {
    margin: 6px 0 0;
    font-size: 1.9rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--accent);
}

.fuel-price span {
    margin-left: 6px;
    font-size: 0.9rem;
    color: rgba(209, 213, 219, 0.78);
}

.fuel-updated {
    margin: 0;
    font-size: 0.85rem;
    color: rgba(148, 163, 184, 0.75);
}
'''

if old_block not in text:
    raise SystemExit('target fuel-item block not found')

text = text.replace(old_block, new_block)
path.write_text(text)