import argparse
import os
from glob import glob
from jinja2 import Environment, FileSystemLoader
import shutil
import yaml
import ntpath
import re

PATH = os.path.dirname(os.path.abspath(__file__))
DS = os.path.sep
parser = argparse.ArgumentParser()
parser.add_argument('-f', '--file', help="Process only a single file")
parser.add_argument('-e', '--env', help="Provide environment")
args = parser.parse_args()

yml = open(os.path.join(PATH, 'deployment', args.env + '.yml'), "r") 
env = yaml.load(yml.read())
yml.close()

dist_dir = os.path.join(PATH, "dist", env['environment'], env['target'])

env['path'] = PATH
env['dist_dir'] = dist_dir
j2_env = Environment(loader=FileSystemLoader(PATH), trim_blocks=True)

def build_file(env, f):
    if os.path.isfile(env['path'] + DS + f):
        f2 = f.replace('\\', '/')
        f3 = os.path.basename(f2)
        target_file = open(os.path.join(env['path'], 'dist', env['environment'], env['target'], f3), "w")
        output = j2_env.get_template(f2).render(env=env).encode("utf-8")

        if env['environment'] == 'release':
            output = re.sub('console.log\(.*\);', '', output)

        target_file.write(output)
        target_file.close()


def build_manifest(env):
    target_file = open(os.path.join(env['path'], 'dist', env['environment'], env['target'], 'manifest.json'), "w")
    target_file.write(j2_env.get_template('manifest.json').render(env=env).encode("utf-8"))
    target_file.close()


def build_all(env):
    result = [y for x in os.walk('src') for y in glob(os.path.join(x[0], '*'))]
    dst_libs_dir = os.path.join(env['path'], 'dist', env['environment'], env['target'], 'libs')
    dst_assets_dir = os.path.join(env['path'], 'dist', env['environment'], env['target'], 'assets')
    
    if os.path.isdir(dst_libs_dir):
        shutil.rmtree(dst_libs_dir)

    if os.path.isdir(dst_assets_dir):
        shutil.rmtree(dst_assets_dir)

    if os.path.isdir(os.path.join(env['path'], 'libs')):
            shutil.copytree(os.path.join(env['path'], 'libs'), dst_libs_dir)

    if os.path.isdir(os.path.join(env['path'], 'assets')):
        shutil.copytree(os.path.join(env['path'], 'assets'), dst_assets_dir)

    for f in result:
        build_file(env, f)

    dist_files = [y for x in os.walk(dist_dir) for y in glob(os.path.join(x[0], '*'))]
    web_accessible_resources = []

    for f in dist_files:
        if os.path.isfile(f):
            web_accessible_resources.append('"' + f.replace(dist_dir + DS, '').replace('\\', '/') + '"')
    
    env['web_accessible_resources'] =  ','.join(web_accessible_resources)
    build_manifest(env)

if not os.path.exists(dist_dir):
    os.makedirs(dist_dir)

if args.file == None:
    build_all(env)
else:
    f = args.file.replace(PATH + DS, '')
    build_file(env, f)