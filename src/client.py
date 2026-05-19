import sys
import socket

def main():
    if len(sys.argv) != 3:
        print("Usage: python client.py <ip> <port>")
        return
    ip, port = sys.argv[1], int(sys.argv[2])
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((ip, port))
    except Exception as e:
        return
    while True:
        try:
            cmd = input()
            if not cmd.strip(): continue
            s.sendall((cmd + '\n').encode())
            response = s.recv(4096).decode()
            if not response: break
            print(response, end="")
        except EOFError:
            break
        except Exception:
            break
    s.close()

if __name__ == '__main__':
    main()
