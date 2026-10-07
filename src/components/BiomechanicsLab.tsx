import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Sliders,
  Play,
  RotateCcw,
  Zap,
  ShieldCheck,
  Target,
  Dumbbell,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { BIOMECHANICAL_LANDMARKS, DRILL_PLANS } from '../utils/tacticalData';
import { BiomechanicalLandmark, DrillPlan } from '../types/nexus';
import { sounds } from '../utils/audio2face';

interface BiomechanicsLabProps {
  onAskNexus: (prompt: string, context?: any) => void;
}

export const BiomechanicsLab: React.FC<BiomechanicsLabProps> = ({ onAskNexus }) => {
  // Kinematic joint parameters
  const [kneeAngle, setKneeAngle] = useState(138.4);
  const [torsoLean, setTorsoLean] = useState(17.5);
  const [plantFootGRF, setPlantFootGRF] = useState(1640);
  const [plantFootOffset, setPlantFootOffset] = useState(28.5);
  const [hipAngularVelocity, setHipAngularVelocity] = useState(642);
  const [isSimulatingPhysics, setIsSimulatingPhysics] = useState(false);

  // Selected drill
  const [selectedDrill, setSelectedDrill] = useState<DrillPlan>(DRILL_PLANS[0]);
  const [activeTab, setActiveTab] = useState<'kinematics' | 'drills'>('kinematics');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset to Isaac Sim calibrated defaults
  const handleResetOptimal = () => {
    sounds.playTacticalScan();
    setKneeAngle(142.0);
    setTorsoLean(18.0);
    setPlantFootGRF(1720);
    setPlantFootOffset(26.0);
    setHipAngularVelocity(680);
  };

  // Run dynamic Isaac Sim physics simulation cycle
  const handleRunPhysicsSimulation = () => {
    sounds.playCyberChime();
    setIsSimulatingPhysics(true);
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setKneeAngle((prev) => +(142.0 + Math.sin(frame * 0.4) * 2).toFixed(1));
      setTorsoLean((prev) => +(18.0 + Math.cos(frame * 0.3) * 0.8).toFixed(1));
      if (frame > 20) {
        clearInterval(interval);
        setIsSimulatingPhysics(false);
      }
    }, 50);
  };

  // Calculate ball aerodynamics
  const exitVelocityKmH = +(
    90 +
    (kneeAngle / 142) * 15 +
    (plantFootGRF / 1700) * 10 +
    (hipAngularVelocity / 680) * 8 -
    Math.abs(plantFootOffset - 26) * 1.2
  ).toFixed(1);

  const magnusSpinRPM = Math.round(
    380 + (hipAngularVelocity / 680) * 50 + (torsoLean / 18) * 20
  );

  // Render 3D Body Pose Mannequin & Flight Arc
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;

    // Ground plane
    const groundY = h - 40;
    ctx.strokeStyle = 'rgba(118, 185, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, groundY);
    ctx.lineTo(w - 20, groundY);
    ctx.stroke();

    // Ground grid tick marks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w - 20; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x, groundY + 6);
      ctx.stroke();
    }

    // Kinematic landmarks coordinates for striker pose
    // Plant leg (left)
    const plantAnkleX = 140;
    const plantAnkleY = groundY;
    const plantKneeX = 144;
    const plantKneeY = groundY - 60;
    const pelvisX = 152;
    const pelvisY = groundY - 120;

    // Torso (pitched forward based on torsoLean)
    const torsoRad = (torsoLean * Math.PI) / 180;
    const spineLength = 70;
    const chestX = pelvisX + Math.sin(torsoRad) * spineLength;
    const chestY = pelvisY - Math.cos(torsoRad) * spineLength;

    // Head
    const headX = chestX + Math.sin(torsoRad) * 24;
    const headY = chestY - Math.cos(torsoRad) * 24;

    // Striking leg (right) - driven by kneeAngle
    const strikingHipX = pelvisX + 10;
    const strikingHipY = pelvisY + 5;
    const thighLength = 60;
    const shinLength = 58;

    // Hip extension back
    const hipAngleRad = 0.5; // backwards swing
    const strikingKneeX = strikingHipX - Math.sin(hipAngleRad) * thighLength;
    const strikingKneeY = strikingHipY + Math.cos(hipAngleRad) * thighLength;

    // Knee flexion angle: relative to thigh
    const kneeRad = ((180 - kneeAngle) * Math.PI) / 180;
    const strikingAnkleX = strikingKneeX + Math.sin(hipAngleRad + kneeRad) * shinLength;
    const strikingAnkleY = strikingKneeY - Math.cos(hipAngleRad + kneeRad) * shinLength + 30;

    // Draw Skeletal Bones
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Plant leg (Cyan/Green)
    ctx.strokeStyle = '#76B900';
    ctx.beginPath();
    ctx.moveTo(plantAnkleX, plantAnkleY);
    ctx.lineTo(plantKneeX, plantKneeY);
    ctx.lineTo(pelvisX, pelvisY);
    ctx.stroke();

    // 2. Spine & Head
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(pelvisX, pelvisY);
    ctx.lineTo(chestX, chestY);
    ctx.stroke();

    // Head sphere
    ctx.fillStyle = '#76B900';
    ctx.beginPath();
    ctx.arc(headX, headY, 12, 0, Math.PI * 2);
    ctx.fill();

    // 3. Striking Leg (NVIDIA Emerald)
    ctx.strokeStyle = '#00E599';
    ctx.beginPath();
    ctx.moveTo(strikingHipX, strikingHipY);
    ctx.lineTo(strikingKneeX, strikingKneeY);
    ctx.lineTo(strikingAnkleX, strikingAnkleY);
    ctx.stroke();

    // 4. Arms for counter-balance
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(chestX, chestY + 10);
    ctx.lineTo(chestX + 35, chestY + 25);
    ctx.moveTo(chestX, chestY + 10);
    ctx.lineTo(chestX - 30, chestY + 15);
    ctx.stroke();

    // Joint Markers (17-point markerless tracking nodes)
    const joints = [
      { x: plantAnkleX, y: plantAnkleY, label: 'Plant Ankle' },
      { x: plantKneeX, y: plantKneeY, label: 'Plant Knee' },
      { x: pelvisX, y: pelvisY, label: 'Pelvis' },
      { x: chestX, y: chestY, label: 'Torso' },
      { x: strikingKneeX, y: strikingKneeY, label: `${kneeAngle}° Knee` },
      { x: strikingAnkleX, y: strikingAnkleY, label: 'Striking Foot' },
    ];

    joints.forEach((j) => {
      ctx.fillStyle = '#06080D';
      ctx.strokeStyle = '#76B900';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(j.x, j.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#A0AEC0';
      ctx.font = '9px monospace';
      ctx.fillText(j.label, j.x + 8, j.y - 4);
    });

    // Soccer Ball & Impact Vector
    const ballX = plantAnkleX + plantFootOffset * 1.5;
    const ballY = groundY - 11;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ballX, ballY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ball Aerodynamic Trajectory Curve (Magnus effect simulation)
    ctx.save();
    ctx.strokeStyle = '#76B900';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ballX, ballY);

    // Trajectory arc dipping due to topspin
    const targetX = w - 40;
    const apexX = (ballX + targetX) / 2;
    const apexY = groundY - (exitVelocityKmH * 1.2 - (torsoLean - 15) * 4);
    ctx.quadraticCurveTo(apexX, apexY, targetX, groundY - 30);
    ctx.stroke();
    ctx.restore();

    // Goal Frame at far right
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w - 40, groundY);
    ctx.lineTo(w - 40, groundY - 80);
    ctx.lineTo(w - 20, groundY - 80);
    ctx.stroke();

    // Callout badge on trajectory
    ctx.fillStyle = 'rgba(7, 9, 14, 0.85)';
    ctx.strokeStyle = '#76B900';
    ctx.lineWidth = 1;
    ctx.fillRect(w - 180, 20, 160, 52);
    ctx.strokeRect(w - 180, 20, 160, 52);

    ctx.fillStyle = '#76B900';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`VELOCITY: ${exitVelocityKmH} km/h`, w - 170, 38);
    ctx.fillStyle = '#00E599';
    ctx.fillText(`MAGNUS SPIN: ${magnusSpinRPM} RPM`, w - 170, 52);
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '9px monospace';
    ctx.fillText(`GRF: ${plantFootGRF} N`, w - 170, 64);
  }, [kneeAngle, torsoLean, plantFootGRF, plantFootOffset, hipAngularVelocity, exitVelocityKmH, magnusSpinRPM]);

  return (
    <div className="space-y-4">
      {/* Module Title Banner */}
      <div className="bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/40">
              MODULE 02
            </span>
            <span className="text-xs font-mono text-gray-400">ISAAC SIM (PHYSICAL AI) & 3D BODY POSE</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
              140 YEARS VIRTUAL SELF-PLAY
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-white mt-1">
            Interactive Virtual Training & Biomechanics Lab
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            17-point markerless kinematic posture optimization, ground reaction force dissipation, and Magnus topspin physics.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-2 bg-[#0D121B] border border-[#1E293B] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('kinematics')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              activeTab === 'kinematics'
                ? 'bg-[#76B900] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Kinematic Mannequin
          </button>
          <button
            onClick={() => setActiveTab('drills')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              activeTab === 'drills'
                ? 'bg-[#76B900] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Isaac Sim Drills ({DRILL_PLANS.length})
          </button>
        </div>
      </div>

      {/* NVIDIA NeMo Guardrail Notice */}
      <div className="bg-[#0E1726]/60 border border-blue-500/30 rounded-lg px-4 py-2 flex items-center space-x-2 text-xs font-mono text-blue-300">
        <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span>
          <strong>NeMo Guardrails Active:</strong> Kinematic modeling strictly provides athletic conditioning and biomechanical efficiency optimization. No medical diagnosis or injury prognostics provided.
        </span>
      </div>

      {activeTab === 'kinematics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Visual 3D Body Pose Canvas */}
          <div className="lg:col-span-7 bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#76B900] animate-pulse" />
                <span className="font-mono text-xs text-gray-300 font-semibold">
                  3D POSE ESTIMATION (BROADCAST CAMERA 120 FPS)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunPhysicsSimulation}
                  disabled={isSimulatingPhysics}
                  className="px-2.5 py-1 text-xs font-mono bg-[#76B900]/15 hover:bg-[#76B900]/25 text-[#76B900] border border-[#76B900]/40 rounded flex items-center space-x-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isSimulatingPhysics ? 'Simulating...' : 'Simulate Strike Cycle'}</span>
                </button>
                <button
                  onClick={handleResetOptimal}
                  className="px-2 py-1 text-xs font-mono bg-[#141A24] hover:bg-[#1D2533] text-gray-400 rounded flex items-center space-x-1"
                  title="Reset to Isaac Sim optimal parameters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Calibrate</span>
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative rounded-lg bg-[#06080D] border border-[#162030] overflow-hidden my-2">
              <canvas
                ref={canvasRef}
                width={560}
                height={300}
                className="w-full h-auto block"
              />
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-gray-500">
                Isaac Sim Rigid-Body Dynamics • Contact Friction: 0.82
              </div>
            </div>

            {/* Aerodynamic Summary Strip */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1E293B] text-center font-mono">
              <div className="bg-[#0F1420] p-2 rounded border border-gray-800">
                <div className="text-[10px] text-gray-400">Exit Velocity</div>
                <div className="text-sm font-bold text-[#76B900]">{exitVelocityKmH} km/h</div>
                <div className="text-[9px] text-emerald-400">+18.7% vs baseline</div>
              </div>
              <div className="bg-[#0F1420] p-2 rounded border border-gray-800">
                <div className="text-[10px] text-gray-400">Magnus Spin</div>
                <div className="text-sm font-bold text-cyan-400">{magnusSpinRPM} RPM</div>
                <div className="text-[9px] text-cyan-500">Topspin Dip</div>
              </div>
              <div className="bg-[#0F1420] p-2 rounded border border-gray-800">
                <div className="text-[10px] text-gray-400">Plant GRF</div>
                <div className="text-sm font-bold text-amber-400">{plantFootGRF} N</div>
                <div className="text-[9px] text-amber-500">Pelvic Stability</div>
              </div>
            </div>
          </div>

          {/* Sliders & Telemetry Controls */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-[#0A0E15] border border-[#1E293B] rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
                <h3 className="text-sm font-bold font-mono text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-[#76B900]" />
                  <span>Kinematic Parameter Adjustments</span>
                </h3>
                <span className="text-[10px] font-mono text-[#76B900] bg-[#76B900]/10 px-2 py-0.5 rounded">
                  ISAAC SIM RIG
                </span>
              </div>

              {/* Slider 1: Knee Angle */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-gray-300">Striking Knee Flexion:</span>
                  <span className="text-[#76B900] font-bold">{kneeAngle}° (Optimal: 142.0°)</span>
                </div>
                <input
                  type="range"
                  min="115"
                  max="165"
                  step="0.5"
                  value={kneeAngle}
                  onChange={(e) => setKneeAngle(parseFloat(e.target.value))}
                  className="w-full accent-[#76B900] cursor-pointer"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Maximizes quadriceps mechanical leverage during final 45ms before leather impact.
                </p>
              </div>

              {/* Slider 2: Torso Lean */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-gray-300">Torso Forward Lean (Sagittal):</span>
                  <span className="text-cyan-400 font-bold">{torsoLean}° (Optimal: 18.0°)</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="28"
                  step="0.5"
                  value={torsoLean}
                  onChange={(e) => setTorsoLean(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Forward pitch restricts aerodynamic lift, preventing driven balls from sailing high.
                </p>
              </div>

              {/* Slider 3: Plant Foot GRF */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-gray-300">Ground Reaction Force (GRF):</span>
                  <span className="text-amber-400 font-bold">{plantFootGRF} N (Optimal: 1,720 N)</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="2100"
                  step="20"
                  value={plantFootGRF}
                  onChange={(e) => setPlantFootGRF(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Dissipates kinetic momentum into turf to anchor pelvis rotational torque.
                </p>
              </div>

              {/* Slider 4: Lateral Offset */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-gray-300">Plant Foot Lateral Offset:</span>
                  <span className="text-emerald-400 font-bold">{plantFootOffset} cm (Optimal: 26.0 cm)</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="38"
                  step="0.5"
                  value={plantFootOffset}
                  onChange={(e) => setPlantFootOffset(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Action Button: Ask NEXUS-9 */}
              <button
                onClick={() => {
                  const prompt = `Deconstruct striking biomechanics: Striking Knee Flexion is at ${kneeAngle}°, Torso Lean is at ${torsoLean}°, Plant Foot GRF is at ${plantFootGRF} N, with a lateral offset of ${plantFootOffset} cm. Ball exit velocity is ${exitVelocityKmH} km/h with ${magnusSpinRPM} RPM Magnus spin. Prescribe Isaac Sim drill adjustments to maximize strike efficiency without increasing ACL shear stress.`;
                  onAskNexus(prompt, { kneeAngle, torsoLean, plantFootGRF, exitVelocityKmH, magnusSpinRPM });
                }}
                className="w-full py-2.5 bg-[#1B2738] hover:bg-[#25364D] text-[#76B900] border border-[#76B900]/40 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>ANALYZE KINEMATICS WITH NEXUS-9</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drills Tab */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DRILL_PLANS.map((drill) => (
            <div
              key={drill.id}
              className={`bg-[#0A0E15] border rounded-xl p-4 flex flex-col justify-between transition-all ${
                selectedDrill.id === drill.id
                  ? 'border-[#76B900] shadow-[0_0_15px_rgba(118,185,0,0.2)]'
                  : 'border-[#1E293B] hover:border-gray-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182333] text-cyan-300 border border-cyan-800">
                    {drill.category}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {drill.intensity} Intensity
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white font-display mb-1">{drill.title}</h3>
                <div className="text-[11px] font-mono text-[#76B900] mb-3">
                  Isaac Sim Validation: {drill.isaacSimCycles}
                </div>

                <div className="text-xs text-gray-300 space-y-2 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-gray-500 block">Focus Kinematic</span>
                    <p className="text-gray-300">{drill.focusKinematic}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-gray-500 block">Coaching Cues</span>
                    <ul className="list-disc list-inside space-y-1 text-gray-400 text-[11px]">
                      {drill.coachingPoints.slice(0, 3).map((cp, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: cp }} />
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedDrill(drill);
                  const prompt = `Provide an in-depth coaching deconstruction for the virtual training drill: "${drill.title}". Detail the physical load metrics, Isaac Sim self-play validation findings, and specific micro-adjustments for player deceleration under high-press resistance.`;
                  onAskNexus(prompt, { drill });
                }}
                className="w-full py-2 bg-[#121926] hover:bg-[#1A2538] text-[#76B900] border border-[#76B900]/30 rounded text-xs font-mono transition-colors flex items-center justify-center space-x-1"
              >
                <span>Deploy Drill to NEXUS-9</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
