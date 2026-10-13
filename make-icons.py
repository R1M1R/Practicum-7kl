"""Рисует PNG-иконки НЕОН-7 без внешних библиотек."""
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def point_in_tri(px, py, a, b, c):
    def sign(p1, p2, p3):
        return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])

    b1 = sign((px, py), a, b) < 0
    b2 = sign((px, py), b, c) < 0
    b3 = sign((px, py), c, a) < 0
    return b1 == b2 == b3


def pixel(x, y, size):
    # Поля оставляем свободными: иконка не обрежется в круглой маске телефона.
    bg = (7, 20, 28, 255)
    sx = x / size
    sy = y / size
    a = (0.28 * size, 0.24 * size)
    b = (0.28 * size, 0.76 * size)
    c = (0.66 * size, 0.50 * size)
    cx, cy, r = 0.74 * size, 0.50 * size, 0.075 * size
    dist_c = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
    ring = abs(dist_c - r)
    if ring <= max(2, size * 0.012):
        return (122, 239, 255, 255)
    if point_in_tri(x, y, a, b, c):
        def dist_line(p, q):
            dx, dy = q[0] - p[0], q[1] - p[1]
            length = max((dx * dx + dy * dy) ** 0.5, 0.001)
            return abs(dy * x - dx * y + q[0] * p[1] - q[1] * p[0]) / length

        thickness = max(3, size * 0.018)
        if min(dist_line(a, b), dist_line(b, c), dist_line(c, a)) <= thickness:
            return (93, 255, 176, 255)
        return (10, 42, 32, 255)
    # Лёгкая сетка
    if int(x) % int(max(8, size / 16)) == 0 and int(y) % int(max(8, size / 16)) == 0:
        return (18, 42, 54, 255)
    return bg


def write_png(path, size):
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            raw.extend(pixel(x, y, size))
    compressed = zlib.compress(bytes(raw), 9)
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')
    path.write_bytes(png)


if __name__ == '__main__':
    for name, size in (('icon-180.png', 180), ('icon-192.png', 192), ('icon-512.png', 512)):
        write_png(ROOT / name, size)
        print(name, size)
