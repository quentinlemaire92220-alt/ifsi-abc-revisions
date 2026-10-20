#!/usr/bin/env node
/**
 * IFSI ABC : assemble an original medical image with *editable* SVG labels/leaders.
 * Usage: node tools/anatomy/compose-svg.mjs spec.json output.svg [--draft]
 * A draft never includes arrows whose endpoints have not been clinically reviewed.
 * This script does not render PNG/PDF and does not certify anatomy or licensing.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {extname, resolve, dirname} from 'node:path';
import {pathToFileURL} from 'node:url';

const xml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
function validateCoordinate(point,label) {
  if(!point||typeof point!=='object'||!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<0||point.x>1||point.y<0||point.y>1)
    throw Error(label+' requires a verified normalized (x,y) point between 0 and 1');
}
function svgFor(manifest,filename,options={}) {
  const draft=Boolean(options.draft);
  if(!manifest||!Number.isInteger(manifest.canvas?.width)||!Number.isInteger(manifest.canvas?.height))
    throw Error('canvas.width and height must be positive integers');
  const {width:w,height:h}=manifest.canvas;
  if(w<600||h<850||w>10000||h>14000)throw Error('A4 canvas out of bounds');
  if(!manifest.sourceImage||typeof manifest.sourceImage!=='string'||/^(?:https?:|data:|file:)/i.test(manifest.sourceImage))
    throw Error('sourceImage must be a local image path, not a remote resource');
  const source=resolve(dirname(filename),manifest.sourceImage);
  const ext=extname(source).toLowerCase();
  const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'}[ext];
  if(!mime)throw Error('Source must be PNG/JPEG/WebP');
  const bytes=readFileSync(source);
  if(bytes.length<100)throw Error('Original image missing or too short');
  if(!Array.isArray(manifest.landmarks)||!manifest.landmarks.length)throw Error('landmarks list is required');
  const ids=new Set(),nodes=[];
  for(const p of manifest.landmarks){
    if(!/^[a-z0-9_\-]{2,80}$/i.test(p.id)||ids.has(p.id))throw Error('Duplicate/invalid landmark id');
    ids.add(p.id);
    if(typeof p.label!=='string'||p.label.length<2||p.label.length>100)throw Error('Missing label for '+p.id);
    if(typeof p.evidence!=='string'||p.evidence.trim().length<10)throw Error('Missing source evidence for '+p.id);
    const ready=p.reviewed===true&&p.status==='verified';
    if(!ready){if(!draft)throw Error('Unverified clinical landmark '+p.id);continue}
    validateCoordinate(p.tip,p.id+'.tip');
    validateCoordinate(p.labelPosition,p.id+'.labelPosition');
    const x=p.tip.x*w,y=p.tip.y*h,tx=p.labelPosition.x*w,ty=p.labelPosition.y*h;
    const connectX=tx+(x>tx?Math.min(240,w*.20):-Math.min(10,w*.02));
    const elbowX=(x+connectX)/2;
    nodes.push(`<g id="label-${xml(p.id)}" class="landmark"><path id="arrow-${xml(p.id)}" d="M ${tx.toFixed(1)} ${ty.toFixed(1)} L ${elbowX.toFixed(1)} ${ty.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}" marker-end="url(#arrowhead)" aria-label="Repère de ${xml(p.label)}"/><text id="text-${xml(p.id)}" x="${tx.toFixed(1)}" y="${(ty-10).toFixed(1)}">${xml(p.label)}</text></g>`);
  }
  if(!draft&&nodes.length!==manifest.landmarks.length)throw Error('Incomplete annotations');
  const b64=bytes.toString('base64');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${xml(manifest.title||'Planche anatomique')}" width="210mm" height="297mm" viewBox="0 0 ${w} ${h}">
 <defs><marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#0c506f"/></marker></defs>
 <style><![CDATA[
 .landmark path{fill:none;stroke:#0c506f;stroke-width:3;stroke-linejoin:round;stroke-linecap:round}
 .landmark text{fill:#13324a;stroke:white;stroke-width:4;paint-order:stroke;stroke-linejoin:round;font-family:Arial,sans-serif;font-size:24px;font-weight:600}
 ]]></style>
 <image id="illustration-source" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" href="data:${mime};base64,${b64}"/>
 <g id="editable-labels-and-arrows">${nodes.join('\n')}</g>
 ${draft?`<g id="draft-watermark"><rect x="20" y="${h-96}" width="${w-40}" height="74" rx="8" fill="#fff9ec" stroke="#ad6833" stroke-width="3"/><text x="${w/2}" y="${h-47}" text-anchor="middle" font-size="24" font-family="Arial,sans-serif" font-weight="bold" fill="#863900">MAQUETTE DE REVUE — ANATOMIE NON VALIDÉE</text></g>`:''}
</svg>\n`;
}

const invoked=process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href;
if(invoked){
 const [, ,specPath,outPath,flag]=process.argv;
 if(!specPath||!outPath|| (flag&&flag!=='--draft')){console.error('Usage: node compose-svg.mjs spec.json output.svg [--draft]');process.exitCode=2}
 else{
   const manifest=JSON.parse(readFileSync(specPath,'utf8'));
   const svg=svgFor(manifest,resolve(specPath),{draft:flag==='--draft'});
   writeFileSync(outPath,svg,'utf8');
   console.log('SVG written: '+outPath+'. SVG editing does not constitute medical approval.');
 }
}
export {svgFor};
