"""Receive a short-lived Sites credential over stdin; never save it to disk or Git config."""
import json
import os
import subprocess
import sys
import termios

if sys.stdin.isatty():
    settings = termios.tcgetattr(sys.stdin)
    settings[3] &= ~termios.ECHO
    termios.tcsetattr(sys.stdin, termios.TCSANOW, settings)
print('Ready for fresh repository credential', flush=True)
credential = json.loads(sys.stdin.readline())
remote = 'https://git.chatgpt-team.site/2b44f6f5-c34d-444b-83e8-53ef432f4f49/appgprj_6aa5bab3c21c819187d24627f0551c1d.git'
if credential.get('remote_url') != remote or credential.get('branch') != 'main':
    raise ValueError('Unexpected repository; refusing to push')
env = os.environ.copy()
env.update(GIT_CONFIG_COUNT='1', GIT_CONFIG_KEY_0='http.extraHeader',
           GIT_CONFIG_VALUE_0='Authorization: Bearer ' + credential['token'])
result = subprocess.run(['git', 'push', remote, 'HEAD:main'], env=env, check=False)
sys.exit(result.returncode)
