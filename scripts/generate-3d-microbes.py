#!/usr/bin/env python3
"""
Generate professional, kawaii, 3D-styled, species-faithful microbe SVG atlases:
1. enemies-v2 (5 rows x 4 cols: Staph aureus variants, MRSA, Crown)
2. microbes-v3 (4 rows x 4 cols: Pneumococcus, E. coli, Pseudomonas, Candida)
"""
import sys

def get_enemies_svg():
    # 4 columns (Forward, Left, Right, Reaction) x 5 rows
    # Frame width: 256, Frame height: 256 -> Total SVG: 1024 x 1280
    W, H = 1024, 1280
    fw, fh = 256, 256

    rows = [
        # (id, name, base_color, highlight, shadow, accent, special)
        ("susceptible", "Staph aureus", "#f6be44", "#fff5c2", "#b87c10", "#e8941a", "cluster"),
        ("beta_lactamase", "Beta-lactamase", "#e6923b", "#ffdeb0", "#a3550e", "#d47413", "shield"),
        ("doxy_resistant", "Doxy resistant", "#e8708c", "#ffd1dc", "#9c2f48", "#c84767", "sparkle"),
        ("dual_resistant", "MRSA", "#8c6ccf", "#decfff", "#50368c", "#6e4bb0", "spikes"),
        ("antigen_b", "Crown Staph", "#38bcc0", "#c4f8f8", "#177276", "#269599", "crown"),
    ]

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">']
    svg.append('<defs>')
    
    # Common filters & gradients
    svg.append('''
      <!-- Soft drop shadow for 3D depth -->
      <filter id="microbe-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#001824" flood-opacity="0.45"/>
      </filter>
      <!-- Glossy eye catchlight glow -->
      <filter id="eye-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.2" result="glow"/>
        <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <!-- Golden crown gradient -->
      <linearGradient id="crown-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff4b8"/>
        <stop offset="50%" stop-color="#ffd54f"/>
        <stop offset="100%" stop-color="#ff9800"/>
      </linearGradient>
    ''')

    for r_idx, (r_id, name, base, hi, sh, acc, spec) in enumerate(rows):
        # Radial gradient for 3D sphere volume
        svg.append(f'''
          <radialGradient id="grad-{r_id}" cx="35%" cy="30%" r="65%" fx="28%" fy="22%">
            <stop offset="0%" stop-color="{hi}"/>
            <stop offset="40%" stop-color="{base}"/>
            <stop offset="85%" stop-color="{sh}"/>
            <stop offset="100%" stop-color="{acc}"/>
          </radialGradient>
        ''')
    svg.append('</defs>')

    # Background transparent
    for r_idx, (r_id, name, base, hi, sh, acc, spec) in enumerate(rows):
        for c_idx in range(4):
            cx = c_idx * fw + fw / 2
            cy = r_idx * fh + fh / 2
            
            # col 0: Forward, col 1: Left, col 2: Right, col 3: Reaction/Squeezed
            eye_off_x = -12 if c_idx == 1 else (12 if c_idx == 2 else 0)
            squish = 1.0
            if c_idx == 3:
                squish = 0.85 # compressed in squeeze

            g = [f'<g id="{r_id}-c{c_idx}" filter="url(#microbe-shadow)">']

            # Staph is grape-like cluster of round cocci!
            # 5-6 spherical cocci overlapping
            # Main central coccus + 4-5 satellite cocci
            cocci = [
                (-34, -22, 34),
                (32, -26, 32),
                (-36, 26, 30),
                (34, 24, 33),
                (0, -42, 28),
                (0, 4, 48), # Center main face coccus
            ]
            if c_idx == 3: # Squeezed reaction: cocci compressed inward
                cocci = [
                    (-24, -18, 30),
                    (22, -20, 29),
                    (-26, 20, 27),
                    (24, 18, 29),
                    (0, -32, 25),
                    (0, 2, 42),
                ]

            for ox, oy, rad in cocci:
                bx = cx + (ox + eye_off_x * 0.3)
                by = cy + oy * squish
                g.append(f'<circle cx="{bx}" cy="{by}" r="{rad}" fill="url(#grad-{r_id})"/>')
                # Specular gloss glint on each sphere
                g.append(f'<ellipse cx="{bx - rad*0.35}" cy="{by - rad*0.35}" rx="{rad*0.28}" ry="{rad*0.18}" fill="#ffffff" opacity="0.65" transform="rotate(-25 {bx - rad*0.35} {by - rad*0.35})"/>')

            # Special accessories
            if spec == "crown":
                # Cute golden crown on top coccus
                top_y = cy - 64 * squish
                top_x = cx + eye_off_x * 0.4
                g.append(f'''
                  <polygon points="{top_x-24},{top_y} {top_x-18},{top_y-26} {top_x-6},{top_y-12} {top_x},{top_y-30} {top_x+6},{top_y-12} {top_x+18},{top_y-26} {top_x+24},{top_y}" fill="url(#crown-gold)" stroke="#d97706" stroke-width="2"/>
                  <circle cx="{top_x}" cy="{top_y-30}" r="3" fill="#ff1744"/>
                  <circle cx="{top_x-18}" cy="{top_y-26}" r="2.5" fill="#00e5ff"/>
                  <circle cx="{top_x+18}" cy="{top_y-26}" r="2.5" fill="#00e5ff"/>
                ''')
            elif spec == "shield":
                # Tiny enzyme shield badge
                badge_x = cx + 38 + eye_off_x * 0.2
                badge_y = cy - 22
                g.append(f'''
                  <path d="M {badge_x} {badge_y-14} Q {badge_x+16} {badge_y-14} {badge_x+16} {badge_y} Q {badge_x+16} {badge_y+16} {badge_x} {badge_y+24} Q {badge_x-16} {badge_y+16} {badge_x-16} {badge_y} Q {badge_x-16} {badge_y-14} {badge_x} {badge_y-14} Z" fill="#ffd15c" stroke="#b45309" stroke-width="2"/>
                  <text x="{badge_x}" y="{badge_y+6}" font-family="Arial" font-size="13" font-weight="900" fill="#78350f" text-anchor="middle">β</text>
                ''')
            elif spec == "spikes":
                # MRSA tough cute spikes / armor headband
                hb_y = cy - 20 * squish
                g.append(f'''
                  <ellipse cx="{cx + eye_off_x*0.4}" cy="{hb_y}" rx="46" ry="12" fill="none" stroke="#e0c3fc" stroke-width="5" opacity="0.85"/>
                  <polygon points="{cx-24},{hb_y-12} {cx-18},{hb_y-28} {cx-12},{hb_y-12}" fill="#ffd54f"/>
                  <polygon points="{cx+12},{hb_y-12} {cx+18},{hb_y-28} {cx+24},{hb_y-12}" fill="#ffd54f"/>
                ''')

            # Kawaii face on the main central coccus
            fx = cx + eye_off_x
            fy = cy + 4 * squish

            # Airbrushed rosy cheeks
            g.append(f'<ellipse cx="{fx - 24}" cy="{fy + 10}" rx="9" ry="5.5" fill="#ff4081" opacity="0.55"/>')
            g.append(f'<ellipse cx="{fx + 24}" cy="{fy + 10}" rx="9" ry="5.5" fill="#ff4081" opacity="0.55"/>')

            if c_idx == 3:
                # Squeezed reaction face: > < eyes with squished cheeks
                g.append(f'''
                  <!-- Squeezed eyes > < -->
                  <path d="M {fx-22} {fy-6} L {fx-12} {fy+1} L {fx-22} {fy+8}" fill="none" stroke="#241405" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M {fx+22} {fy-6} L {fx+12} {fy+1} L {fx+22} {fy+8}" fill="none" stroke="#241405" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- Wavy squished mouth -->
                  <path d="M {fx-8} {fy+16} Q {fx-4} {fy+12} {fx} {fy+16} Q {fx+4} {fy+20} {fx+8} {fy+16}" fill="none" stroke="#241405" stroke-width="3.5" stroke-linecap="round"/>
                  <!-- Squeeze sweat drop -->
                  <path d="M {fx+32} {fy-24} Q {fx+42} {fy-16} {fx+38} {fy-8} Q {fx+30} {fy-12} {fx+32} {fy-24} Z" fill="#67e8f9" opacity="0.85"/>
                ''')
            else:
                # Cheerful kawaii bead eyes with glossy catchlights
                ey_y = fy + 2
                g.append(f'''
                  <!-- Left bead eye -->
                  <circle cx="{fx - 16}" cy="{ey_y}" r="6.5" fill="#1e1808"/>
                  <circle cx="{fx - 18}" cy="{ey_y - 2.5}" r="2.4" fill="#ffffff"/>
                  <circle cx="{fx - 14}" cy="{ey_y + 2}" r="1.2" fill="#ffffff"/>
                  <!-- Right bead eye -->
                  <circle cx="{fx + 16}" cy="{ey_y}" r="6.5" fill="#1e1808"/>
                  <circle cx="{fx + 14}" cy="{ey_y - 2.5}" r="2.4" fill="#ffffff"/>
                  <circle cx="{fx + 18}" cy="{ey_y + 2}" r="1.2" fill="#ffffff"/>
                  <!-- Cute smile -->
                  <path d="M {fx - 7} {fy + 14} Q {fx} {fy + 22} {fx + 7} {fy + 14}" fill="none" stroke="#1e1808" stroke-width="3.5" stroke-linecap="round"/>
                ''')

            g.append('</g>')
            svg.extend(g)

    svg.append('</svg>')
    return '\n'.join(svg)

def get_microbes_svg():
    # 4 columns x 4 rows
    # Frame width: 256, Frame height: 256 -> Total SVG: 1024 x 1024
    W, H = 1024, 1024
    fw, fh = 256, 256

    rows = [
        # (id, name, species)
        ("pneumococcus", "Streptococcus pneumoniae", "capsule_twins"),
        ("ecoli", "Escherichia coli", "rod_flagella"),
        ("pseudomonas", "Pseudomonas aeruginosa", "polar_flagellum"),
        ("candida", "Candida albicans", "budding_yeast"),
    ]

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">']
    svg.append('<defs>')
    
    # Shaders & gradients
    svg.append('''
      <filter id="m-shadow" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#001824" flood-opacity="0.45"/>
      </filter>

      <!-- Pneumococcus Lavender 3D -->
      <radialGradient id="grad-pneumo" cx="35%" cy="30%" r="65%" fx="28%" fy="22%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="35%" stop-color="#bfbaf5"/>
        <stop offset="75%" stop-color="#8a80df"/>
        <stop offset="100%" stop-color="#675cb8"/>
      </radialGradient>
      <!-- Translucent Capsule Halo -->
      <radialGradient id="grad-capsule" cx="50%" cy="50%" r="50%">
        <stop offset="65%" stop-color="#c4b5fd" stop-opacity="0.22"/>
        <stop offset="90%" stop-color="#a78bfa" stop-opacity="0.48"/>
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.75"/>
      </radialGradient>

      <!-- E. Coli Coral Rod 3D -->
      <radialGradient id="grad-ecoli" cx="35%" cy="28%" r="65%" fx="28%" fy="20%">
        <stop offset="0%" stop-color="#ffded9"/>
        <stop offset="35%" stop-color="#f89f94"/>
        <stop offset="78%" stop-color="#d95d50"/>
        <stop offset="100%" stop-color="#a83529"/>
      </radialGradient>

      <!-- Pseudomonas Mint Aquatic Rod 3D -->
      <radialGradient id="grad-pseudo" cx="35%" cy="28%" r="65%" fx="28%" fy="20%">
        <stop offset="0%" stop-color="#d2faf4"/>
        <stop offset="35%" stop-color="#5eead4"/>
        <stop offset="78%" stop-color="#14b8a6"/>
        <stop offset="100%" stop-color="#0f766e"/>
      </radialGradient>

      <!-- Candida Warm Pearlescent Yeast 3D -->
      <radialGradient id="grad-candida" cx="34%" cy="28%" r="66%" fx="26%" fy="20%">
        <stop offset="0%" stop-color="#fffbf0"/>
        <stop offset="35%" stop-color="#fde68a"/>
        <stop offset="78%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#92400e"/>
      </radialGradient>
    ''')
    svg.append('</defs>')

    for r_idx, (r_id, name, kind) in enumerate(rows):
        for c_idx in range(4):
            cx = c_idx * fw + fw / 2
            cy = r_idx * fh + fh / 2
            
            eye_off_x = -12 if c_idx == 1 else (12 if c_idx == 2 else 0)
            is_hit = (c_idx == 3)
            g = [f'<g id="{r_id}-c{c_idx}" filter="url(#m-shadow)">']

            if kind == "capsule_twins":
                # Pneumococcus: Paired lancet-shaped cocci inside a glowing capsule halo
                # Translucent capsule bubble
                cap_rx = 78 if not is_hit else 70
                cap_ry = 58 if not is_hit else 50
                g.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{cap_rx}" ry="{cap_ry}" fill="url(#grad-capsule)" stroke="#a78bfa" stroke-width="2.5" stroke-dasharray="10 4"/>')
                
                # Twin paired pointed cocci
                for side, off in [("left", -26), ("right", 26)]:
                    tx = cx + off + eye_off_x * 0.3
                    ty = cy
                    rot = -16 if side == "left" else 16
                    g.append(f'<ellipse cx="{tx}" cy="{ty}" rx="25" ry="34" fill="url(#grad-pneumo)" transform="rotate({rot} {tx} {ty})"/>')
                    g.append(f'<ellipse cx="{tx - 7}" cy="{ty - 12}" rx="8" ry="5" fill="#ffffff" opacity="0.65" transform="rotate({rot} {tx} {ty})"/>')
                    
                    # Cheeks & eyes on twin
                    g.append(f'<ellipse cx="{tx - 11}" cy="{ty + 6}" rx="5" ry="3.5" fill="#ff4081" opacity="0.5"/>')
                    g.append(f'<ellipse cx="{tx + 11}" cy="{ty + 6}" rx="5" ry="3.5" fill="#ff4081" opacity="0.5"/>')
                    if is_hit:
                        g.append(f'<path d="M {tx-8} {ty} L {tx-3} {ty+4} L {tx-8} {ty+8}" fill="none" stroke="#2e1065" stroke-width="2.5" stroke-linecap="round"/>')
                        g.append(f'<path d="M {tx+8} {ty} L {tx+3} {ty+4} L {tx+8} {ty+8}" fill="none" stroke="#2e1065" stroke-width="2.5" stroke-linecap="round"/>')
                        g.append(f'<ellipse cx="{tx}" cy="{ty+12}" rx="3" ry="4" fill="#2e1065"/>')
                    else:
                        g.append(f'<circle cx="{tx - 6}" cy="{ty + 1}" r="3.8" fill="#1e1b4b"/>')
                        g.append(f'<circle cx="{tx - 7}" cy="{ty - 0.5}" r="1.4" fill="#ffffff"/>')
                        g.append(f'<circle cx="{tx + 6}" cy="{ty + 1}" r="3.8" fill="#1e1b4b"/>')
                        g.append(f'<circle cx="{tx + 5}" cy="{ty - 0.5}" r="1.4" fill="#ffffff"/>')
                        g.append(f'<path d="M {tx - 4} {ty + 8} Q {tx} {ty + 12} {tx + 4} {ty + 8}" fill="none" stroke="#1e1b4b" stroke-width="2.2" stroke-linecap="round"/>')

            elif kind == "rod_flagella":
                # E. Coli: Short rounded rod with wavy flagella tails trailing behind
                fx = cx + eye_off_x
                fy = cy
                rod_w = 110 if not is_hit else 95
                rod_h = 62 if not is_hit else 52

                # Wavy flagella tails streaming from rear
                for i, fy_off in enumerate([-22, -8, 8, 22]):
                    tail_start_x = cx - rod_w/2 + 8
                    tail_start_y = cy + fy_off
                    ctrl1_x = tail_start_x - 25
                    ctrl1_y = tail_start_y + (12 if i%2 else -12)
                    ctrl2_x = tail_start_x - 50
                    ctrl2_y = tail_start_y - (12 if i%2 else -12)
                    end_x = tail_start_x - 72
                    end_y = tail_start_y + (6 if i%2 else -6)
                    g.append(f'<path d="M {tail_start_x} {tail_start_y} C {ctrl1_x} {ctrl1_y}, {ctrl2_x} {ctrl2_y}, {end_x} {end_y}" fill="none" stroke="#f87171" stroke-width="3" stroke-linecap="round" opacity="0.85"/>')

                # Main 3D rounded capsule body
                g.append(f'<rect x="{cx - rod_w/2}" y="{cy - rod_h/2}" width="{rod_w}" height="{rod_h}" rx="{rod_h/2}" fill="url(#grad-ecoli)"/>')
                # Specular top highlight
                g.append(f'<ellipse cx="{cx - 8}" cy="{cy - rod_h/2 + 12}" rx="{rod_w*0.38}" ry="7" fill="#ffffff" opacity="0.6"/>')

                # Cheeks & Face
                g.append(f'<ellipse cx="{fx - 24}" cy="{fy + 12}" rx="8" ry="5" fill="#f43f5e" opacity="0.55"/>')
                g.append(f'<ellipse cx="{fx + 24}" cy="{fy + 12}" rx="8" ry="5" fill="#f43f5e" opacity="0.55"/>')
                if is_hit:
                    g.append(f'<path d="M {fx-22} {fy-2} L {fx-12} {fy+4} L {fx-22} {fy+10}" fill="none" stroke="#450a0a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>')
                    g.append(f'<path d="M {fx+22} {fy-2} L {fx+12} {fy+4} L {fx+22} {fy+10}" fill="none" stroke="#450a0a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>')
                    g.append(f'<path d="M {fx-8} {fy+16} Q {fx} {fy+12} {fx+8} {fy+16}" fill="none" stroke="#450a0a" stroke-width="3" stroke-linecap="round"/>')
                else:
                    g.append(f'''
                      <circle cx="{fx - 15}" cy="{fy + 2}" r="6" fill="#450a0a"/>
                      <circle cx="{fx - 17}" cy="{fy - 0.5}" r="2.2" fill="#ffffff"/>
                      <circle cx="{fx + 15}" cy="{fy + 2}" r="6" fill="#450a0a"/>
                      <circle cx="{fx + 13}" cy="{fy - 0.5}" r="2.2" fill="#ffffff"/>
                      <path d="M {fx - 7} {fy + 14} Q {fx} {fy + 20} {fx + 7} {fy + 14}" fill="none" stroke="#450a0a" stroke-width="3.2" stroke-linecap="round"/>
                    ''')

            elif kind == "polar_flagellum":
                # Pseudomonas: Slender aerodynamic teal rod with rotating polar flagellum
                fx = cx + eye_off_x
                fy = cy
                rod_w = 120 if not is_hit else 105
                rod_h = 54 if not is_hit else 46

                # Long swirling corkscrew polar flagellum from left rear pole
                tail_start_x = cx - rod_w/2 + 6
                tail_start_y = cy
                g.append(f'<path d="M {tail_start_x} {tail_start_y} Q {tail_start_x-22} {tail_start_y-24} {tail_start_x-44} {tail_start_y} T {tail_start_x-88} {tail_start_y}" fill="none" stroke="#2dd4bf" stroke-width="3.8" stroke-linecap="round" opacity="0.9"/>')

                # Main 3D slender capsule body
                g.append(f'<rect x="{cx - rod_w/2}" y="{cy - rod_h/2}" width="{rod_w}" height="{rod_h}" rx="{rod_h/2}" fill="url(#grad-pseudo)"/>')
                g.append(f'<ellipse cx="{cx - 5}" cy="{cy - rod_h/2 + 10}" rx="{rod_w*0.4}" ry="6" fill="#ffffff" opacity="0.65"/>')

                # Cheeks & Face
                g.append(f'<ellipse cx="{fx - 24}" cy="{fy + 10}" rx="8" ry="5" fill="#047857" opacity="0.45"/>')
                g.append(f'<ellipse cx="{fx + 24}" cy="{fy + 10}" rx="8" ry="5" fill="#047857" opacity="0.45"/>')
                if is_hit:
                    g.append(f'<path d="M {fx-20} {fy-2} L {fx-11} {fy+3} L {fx-20} {fy+8}" fill="none" stroke="#042f2e" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>')
                    g.append(f'<path d="M {fx+20} {fy-2} L {fx+11} {fy+3} L {fx+20} {fy+8}" fill="none" stroke="#042f2e" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>')
                    g.append(f'<ellipse cx="{fx}" cy="{fy+14}" rx="5" ry="6" fill="#042f2e"/>')
                else:
                    g.append(f'''
                      <circle cx="{fx - 15}" cy="{fy + 1}" r="6" fill="#042f2e"/>
                      <circle cx="{fx - 17}" cy="{fy - 1}" r="2.2" fill="#ffffff"/>
                      <circle cx="{fx + 15}" cy="{fy + 1}" r="6" fill="#042f2e"/>
                      <circle cx="{fx + 13}" cy="{fy - 1}" r="2.2" fill="#ffffff"/>
                      <path d="M {fx - 7} {fy + 13} Q {fx} {fy + 19} {fx + 7} {fy + 13}" fill="none" stroke="#042f2e" stroke-width="3.2" stroke-linecap="round"/>
                    ''')

            elif kind == "budding_yeast":
                # Candida: Plump pearlescent mother yeast with adorable tiny baby bud sprouting
                fx = cx + eye_off_x * 0.8
                fy = cy + 8

                # Main mother yeast oval
                g.append(f'<ellipse cx="{cx - 10}" cy="{cy + 10}" rx="46" ry="56" fill="url(#grad-candida)"/>')
                g.append(f'<ellipse cx="{cx - 24}" cy="{cy - 16}" rx="18" ry="12" fill="#ffffff" opacity="0.65" transform="rotate(-30 {cx-24} {cy-16})"/>')

                # Baby bud cell sprouting on shoulder
                bud_x = cx + 36
                bud_y = cy - 28
                g.append(f'<ellipse cx="{bud_x}" cy="{bud_y}" rx="24" ry="28" fill="url(#grad-candida)" transform="rotate(25 {bud_x} {bud_y})"/>')
                g.append(f'<ellipse cx="{bud_x - 8}" cy="{bud_y - 12}" rx="9" ry="6" fill="#ffffff" opacity="0.65" transform="rotate(25 {bud_x-8} {bud_y-12})"/>')
                
                # Baby cute face
                g.append(f'<circle cx="{bud_x - 5}" cy="{bud_y}" r="3" fill="#451a03"/>')
                g.append(f'<circle cx="{bud_x + 5}" cy="{bud_y}" r="3" fill="#451a03"/>')
                g.append(f'<path d="M {bud_x - 3} {bud_y + 6} Q {bud_x} {bud_y + 9} {bud_x + 3} {bud_y + 6}" fill="none" stroke="#451a03" stroke-width="1.8" stroke-linecap="round"/>')

                # Mother Face
                g.append(f'<ellipse cx="{fx - 30}" cy="{fy + 12}" rx="9" ry="5.5" fill="#f59e0b" opacity="0.5"/>')
                g.append(f'<ellipse cx="{fx + 10}" cy="{fy + 12}" rx="9" ry="5.5" fill="#f59e0b" opacity="0.5"/>')
                if is_hit:
                    g.append(f'<path d="M {fx-26} {fy-2} L {fx-17} {fy+3} L {fx-26} {fy+8}" fill="none" stroke="#451a03" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>')
                    g.append(f'<path d="M {fx+4} {fy-2} L {fx+13} {fy+3} L {fx+4} {fy+8}" fill="none" stroke="#451a03" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>')
                    g.append(f'<path d="M {fx-14} {fy+18} Q {fx-6} {fy+14} {fx+2} {fy+18}" fill="none" stroke="#451a03" stroke-width="3" stroke-linecap="round"/>')
                else:
                    g.append(f'''
                      <circle cx="{fx - 20}" cy="{fy + 2}" r="6" fill="#451a03"/>
                      <circle cx="{fx - 22}" cy="{fy - 0.5}" r="2.2" fill="#ffffff"/>
                      <circle cx="{fx + 1}" cy="{fy + 2}" r="6" fill="#451a03"/>
                      <circle cx="{fx - 1}" cy="{fy - 0.5}" r="2.2" fill="#ffffff"/>
                      <path d="M {fx - 14} {fy + 16} Q {fx - 9} {fy + 22} {fx - 4} {fy + 16}" fill="none" stroke="#451a03" stroke-width="3.2" stroke-linecap="round"/>
                    ''')

            g.append('</g>')
            svg.extend(g)

    svg.append('</svg>')
    return '\n'.join(svg)

if __name__ == '__main__':
    with open('public/assets/enemies-3d.svg', 'w') as f:
        f.write(get_enemies_svg())
    print("Wrote public/assets/enemies-3d.svg")

    with open('public/assets/microbes-3d.svg', 'w') as f:
        f.write(get_microbes_svg())
    print("Wrote public/assets/microbes-3d.svg")
