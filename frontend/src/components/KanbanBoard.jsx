import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, Tag as TagIcon } from 'lucide-react';

export default function KanbanBoard({ tasks, onDragEnd, onTaskClick }) {
  const columns = {
    todo: {
      name: 'A Fazer',
      items: tasks.filter(t => t.status === 'todo')
    },
    in_progress: {
      name: 'Fazendo',
      items: tasks.filter(t => t.status === 'in_progress')
    },
    done: {
      name: 'Concluído',
      items: tasks.filter(t => t.status === 'done')
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'var(--accent)';
      case 'medium': return 'var(--status-todo)';
      case 'low': return 'var(--status-done)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: '320px',
                flex: 1
              }}
              key={columnId}
            >
              <div className="glass-panel" style={{ padding: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontWeight: 600 }}>{column.name}</h3>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.85rem' }}>
                  {column.items.length}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => {
                    return (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDraggingOver ? 'rgba(138, 43, 226, 0.05)' : 'transparent',
                          padding: '10px',
                          borderRadius: '16px',
                          minHeight: '400px',
                          transition: 'background 0.3s ease',
                          border: snapshot.isDraggingOver ? '1px dashed var(--primary)' : '1px solid transparent'
                        }}
                      >
                        {column.items.map((item, index) => {
                          return (
                            <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                              {(provided, snapshot) => {
                                return (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="glass-panel"
                                    style={{
                                      userSelect: 'none',
                                      padding: '18px',
                                      margin: '0 0 16px 0',
                                      minHeight: '50px',
                                      backgroundColor: snapshot.isDragging ? 'rgba(40,40,55,0.95)' : 'var(--bg-card)',
                                      cursor: 'grab',
                                      borderLeft: `4px solid ${getPriorityColor(item.priority)}`,
                                      boxShadow: snapshot.isDragging ? '0 10px 25px rgba(0,0,0,0.5)' : '',
                                      ...provided.draggableProps.style
                                    }}
                                    onClick={() => onTaskClick(item)}
                                  >
                                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{item.title}</h4>
                                    
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                      {item.due_date && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                          <Calendar size={14} />
                                          {item.due_date}
                                        </span>
                                      )}
                                      {item.category && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                          <TagIcon size={14} />
                                          {item.category}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}
