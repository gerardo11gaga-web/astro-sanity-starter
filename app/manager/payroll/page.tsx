'use client';
import { useState } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Thead, Tbody, Th, Td } from '@/components/ui/Table';
import { Download, DollarSign } from 'lucide-react';

function getDefaultDates() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export default function PayrollPage() {
  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function generatePayroll() {
    setLoading(true);
    const res = await fetch('/api/payroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_date: startDate, end_date: endDate }),
    });
    if (res.ok) setResult(await res.json());
    setLoading(false);
  }

  function exportCSV() {
    if (!result) return;
    const rows = [
      ['Name', 'Type', 'Regular Hours', 'Overtime Hours', 'Total Hours', 'Gross Pay'],
      ...result.employees.map((e: any) => [
        e.name, e.employee_type, e.regular_hours.toFixed(2), e.overtime_hours.toFixed(2),
        e.total_hours.toFixed(2), `$${e.gross_pay.toFixed(2)}`
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${startDate}_${endDate}.csv`;
    a.click();
  }

  const totalGross = result?.employees?.reduce((sum: number, e: any) => sum + e.gross_pay, 0) || 0;
  const totalHours = result?.employees?.reduce((sum: number, e: any) => sum + e.total_hours, 0) || 0;

  return (
    <ManagerLayout title="Payroll">
      <div className="max-w-6xl space-y-6">
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-end gap-4">
              <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
              <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
              <Button onClick={generatePayroll} loading={loading}>Generate Payroll</Button>
              {result && (
                <Button variant="outline" onClick={exportCSV}>
                  <Download size={16} /> Export CSV
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {result && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardBody className="flex items-center gap-4">
                  <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={22} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Gross Pay</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>${totalGross.toFixed(2)}</p>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="flex items-center gap-4">
                  <div style={{ width: '48px', height: '48px', background: '#DCFCE7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={22} style={{ color: '#166534' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Hours</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{totalHours.toFixed(1)}</p>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="flex items-center gap-4">
                  <div style={{ width: '48px', height: '48px', background: '#FEE2E2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={22} style={{ color: '#991B1B' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Employees Paid</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{result.employees.length}</p>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Employee Table */}
            <Table>
              <Thead>
                <tr>
                  <Th>Employee</Th>
                  <Th>Type</Th>
                  <Th>Regular Hrs</Th>
                  <Th>OT Hrs</Th>
                  <Th>Departments</Th>
                  <Th>Gross Pay</Th>
                </tr>
              </Thead>
              <Tbody>
                {result.employees.map((emp: any, i: number) => (
                  <tr key={emp.employee_id}
                    style={{ background: i % 2 === 1 ? 'var(--surface-alt)' : 'var(--surface)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? 'var(--surface-alt)' : 'var(--surface)')}>
                    <Td><span className="font-medium">{emp.name}</span></Td>
                    <Td><Badge>{emp.employee_type}</Badge></Td>
                    <Td>{emp.regular_hours.toFixed(1)}</Td>
                    <Td>
                      {emp.overtime_hours > 0
                        ? <span style={{ color: 'var(--warning)', fontWeight: 500 }}>{emp.overtime_hours.toFixed(1)}</span>
                        : '0'
                      }
                    </Td>
                    <Td>
                      <div className="space-y-1">
                        {emp.departments.map((d: any, idx: number) => (
                          <div key={idx} className="text-xs">
                            <span className="font-medium">{d.name}</span>: {d.hours.toFixed(1)}h @ ${d.pay_rate}/hr = ${d.subtotal.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </Td>
                    <Td><span style={{ fontWeight: 700, color: 'var(--text)' }}>${emp.gross_pay.toFixed(2)}</span></Td>
                  </tr>
                ))}
              </Tbody>
            </Table>

            {/* Cash payroll section */}
            {result.employees.some((e: any) => e.employee_type === 'cash') && (
              <Card>
                <CardHeader><h3 className="font-semibold" style={{ color: 'var(--text)' }}>Cash Payroll</h3></CardHeader>
                <CardBody>
                  <Table>
                    <Thead>
                      <tr>
                        <Th>Employee</Th>
                        <Th>Hours</Th>
                        <Th>Amount</Th>
                      </tr>
                    </Thead>
                    <Tbody>
                      {result.employees.filter((e: any) => e.employee_type === 'cash').map((emp: any) => (
                        <tr key={emp.employee_id}>
                          <Td>{emp.name}</Td>
                          <Td>{emp.total_hours.toFixed(1)}</Td>
                          <Td><span style={{ fontWeight: 700 }}>${emp.gross_pay.toFixed(2)}</span></Td>
                        </tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>
    </ManagerLayout>
  );
}
